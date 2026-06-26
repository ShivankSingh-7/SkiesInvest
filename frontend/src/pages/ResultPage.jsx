import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import AnalysisCard from '../components/AnalysisCard';
import EvidenceList from '../components/EvidenceList';
import RiskCard from '../components/RiskCard';

const TABS = [
  { id: 'overview', label: '📋 Overview' },
  { id: 'evidence', label: '📊 Evidence' },
  { id: 'risks',    label: '⚠️ Risks' },
];

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName } = location.state || {};

  const [status, setStatus] = useState('loading');
  const [progressLog, setProgressLog] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!companyName) { navigate('/'); return; }
    setStatus('loading');
    setProgressLog([]);
    setResult(null);
    setError(null);
    setActiveTab('overview');
    runAnalysis(companyName);
  }, [companyName]);

  async function runAnalysis(name) {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: name }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === 'progress') setProgressLog((p) => [...p, data]);
              else if (currentEvent === 'complete') { setResult(data); setStatus('done'); }
              else if (currentEvent === 'error') { setError(data.error || 'Analysis failed'); setStatus('error'); }
              else if (currentEvent === 'start') {
                setProgressLog([{ stage: 'init', message: `Starting analysis for "${data.companyName}"`, timestamp: data.timestamp }]);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Analysis failed');
      setStatus('error');
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────
  if (status === 'loading') {
    return <LoadingScreen companyName={companyName} progressLog={progressLog} />;
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="bg-animated" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="glass-card" style={{ padding: 40, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>Analysis Failed</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>{error}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/')} style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 14,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
            }}>← Back</button>
            <button onClick={() => { setStatus('loading'); setProgressLog([]); setError(null); runAnalysis(companyName); }}
              className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────
  const decisionColor =
    result?.decision === 'INVEST'       ? '#10b981' :
    result?.decision === 'WATCH'        ? '#60a5fa' :
    result?.decision === 'PASS'         ? '#f43f5e' : '#f59e0b';

  const decisionLabel =
    result?.decision === 'INVEST'       ? 'Invest' :
    result?.decision === 'WATCH'        ? 'Watch' :
    result?.decision === 'PASS'         ? 'Pass' : 'Inconclusive';

  return (
    <div className="bg-animated" style={{ minHeight: '100vh', width: '100%' }}>

      {/* ── Sticky Nav ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(5,13,26,0.92)', backdropFilter: 'blur(16px)',
        width: '100%',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 58,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/')} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, fontSize: 13,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
            }}>← Back</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>📈</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{companyName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: decisionColor,
                boxShadow: `0 0 6px ${decisionColor}`,
              }} />
              <span style={{
                fontSize: 12, fontWeight: 700, color: decisionColor, letterSpacing: '0.04em',
              }}>
              {decisionLabel}
              </span>
            </div>
            <button
              onClick={() => { setStatus('loading'); setProgressLog([]); setResult(null); runAnalysis(companyName); }}
              title="Re-analyze"
              style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14,
              }}
            >🔄</button>
          </div>
        </div>
      </nav>

      {/* ── Page Body ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* ── Tab Bar ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'inline-flex', gap: 4, padding: 6,
          borderRadius: 14, marginBottom: 28,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────────── */}
        {activeTab === 'overview' && <AnalysisCard result={result} />}

        {activeTab === 'evidence' && (
          <div className="fade-in">
            <div style={{
              padding: '14px 18px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)',
              fontSize: 13, color: '#60a5fa', fontWeight: 500,
            }}>
              📌 Evidence Coverage: <strong style={{ fontFamily: 'monospace' }}>{result?.evidenceCoverage}%</strong>
              &nbsp;·&nbsp;
              {result?.findings?.filter((f) => f.isVerified).length || 0} verified &nbsp;·&nbsp;
              {result?.findings?.length || 0} total findings
            </div>
            <EvidenceList findings={result?.findings || []} showUnverified />
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="fade-in">
            <RiskCard riskAnalysis={result?.riskAnalysis} />
          </div>
        )}

        {/* ── Footer Meta ─────────────────────────────────────────────── */}
        <div style={{
          marginTop: 40, paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: 8, fontSize: 11, color: 'var(--text-muted)',
        }}>
          <span>Analysis completed in {((result?.durationMs || 0) / 1000).toFixed(1)}s</span>
          <span>{result?.analyzedAt ? new Date(result.analyzedAt).toLocaleString() : ''}</span>
          <span>Not financial advice</span>
        </div>
      </div>
    </div>
  );
}
