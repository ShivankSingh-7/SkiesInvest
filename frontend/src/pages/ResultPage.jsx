import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import AnalysisCard from '../components/AnalysisCard';
import EvidenceList from '../components/EvidenceList';
import RiskCard from '../components/RiskCard';

const TABS = [
  { id: 'overview', label: '📋 Overview' },
  { id: 'evidence', label: '📊 Evidence' },
  { id: 'risks', label: '⚠️ Risks' },
];

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName } = location.state || {};

  const [status, setStatus] = useState('loading'); // loading | done | error
  const [progressLog, setProgressLog] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!companyName) {
      navigate('/');
      return;
    }

    // Reset state for new analysis
    setStatus('loading');
    setProgressLog([]);
    setResult(null);
    setError(null);
    setActiveTab('overview');

    runAnalysis(companyName);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [companyName]);

  async function runAnalysis(name) {
    try {
      // Use fetch with ReadableStream to handle SSE (EventSource doesn't support POST)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: name }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line

        let currentEvent = null;
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (currentEvent === 'progress') {
                setProgressLog((prev) => [...prev, data]);
              } else if (currentEvent === 'complete') {
                setResult(data);
                setStatus('done');
              } else if (currentEvent === 'error') {
                setError(data.error || 'Analysis failed');
                setStatus('error');
              } else if (currentEvent === 'start') {
                setProgressLog([{ stage: 'init', message: `Starting analysis for "${data.companyName}"`, timestamp: data.timestamp }]);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // If stream ended without a complete event, show error
      if (status === 'loading') {
        setError('Analysis stream ended unexpectedly');
        setStatus('error');
      }
    } catch (err) {
      console.error('[ResultPage] Error:', err);
      setError(err.message || 'Analysis failed');
      setStatus('error');
    }
  }

  // ── Loading State ─────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <LoadingScreen
        companyName={companyName}
        progressLog={progressLog}
      />
    );
  }

  // ── Error State ───────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center p-6">
        <div className="glass-card p-8 max-w-md text-center">
          <p className="text-4xl mb-4">❌</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Analysis Failed
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={() => {
                setStatus('loading');
                setProgressLog([]);
                setError(null);
                runAnalysis(companyName);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-primary"
            >
              <span className="flex items-center gap-2"><RefreshCw size={14} /> Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Result State ──────────────────────────────────────────────────────
  const decisionColor =
    result?.decision === 'INVEST' ? '#10b981' :
    result?.decision === 'PASS' ? '#f43f5e' : '#f59e0b';

  return (
    <div className="min-h-screen bg-animated">
      {/* ── Top Nav ───────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'rgba(5,13,26,0.9)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: '#3b82f6' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {companyName}
            </span>
          </div>
        </div>

        {/* Decision badge in nav */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              background: `${decisionColor}15`,
              color: decisionColor,
              border: `1px solid ${decisionColor}30`,
            }}
          >
            {result?.decision || 'NEED_MORE_DATA'}
          </span>
          <button
            onClick={() => {
              setStatus('loading');
              setProgressLog([]);
              setResult(null);
              runAnalysis(companyName);
            }}
            className="p-2 rounded-lg transition-all"
            title="Re-analyze"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 p-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', width: 'fit-content' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <AnalysisCard result={result} />
        )}

        {activeTab === 'evidence' && (
          <div className="fade-in">
            <div className="glass-card p-4 mb-5" style={{ border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.04)' }}>
              <p className="text-xs font-semibold" style={{ color: '#60a5fa' }}>
                📌 Evidence Coverage: <strong className="font-mono">{result?.evidenceCoverage}%</strong>
                &nbsp;·&nbsp;
                {result?.findings?.filter((f) => f.isVerified).length || 0} verified findings
                &nbsp;·&nbsp;
                {result?.findings?.length || 0} total
              </p>
            </div>
            <EvidenceList findings={result?.findings || []} showUnverified />
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="fade-in">
            <RiskCard riskAnalysis={result?.riskAnalysis} />
          </div>
        )}

        {/* ── Metadata Footer ───────────────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t flex items-center justify-between text-xs flex-wrap gap-3"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>Analysis completed in {((result?.durationMs || 0) / 1000).toFixed(1)}s</span>
          <span>{new Date(result?.analyzedAt).toLocaleString()}</span>
          <span>Not financial advice</span>
        </div>
      </div>
    </div>
  );
}
