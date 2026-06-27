import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Activity, ClipboardList, CheckCircle, ShieldAlert } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import AnalysisCard from '../components/AnalysisCard';
import EvidenceList from '../components/EvidenceList';
import RiskCard from '../components/RiskCard';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <ClipboardList size={14} /> },
  { id: 'evidence', label: 'Evidence', icon: <CheckCircle size={14} /> },
  { id: 'risks',    label: 'Risks', icon: <ShieldAlert size={14} /> },
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
  const fetchedRef = useRef(null);

  useEffect(() => {
    if (!companyName) { navigate('/'); return; }
    if (fetchedRef.current === companyName) return;
    fetchedRef.current = companyName;

    setStatus('loading');
    setProgressLog([]);
    setResult(null);
    setError(null);
    setActiveTab('overview');
    runAnalysis(companyName);
  }, [companyName, navigate]);

  async function runAnalysis(name) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/analyze`, {
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="flat-card" style={{ padding: 40, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Analysis Failed</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>{error}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/')} style={{
              padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => { setStatus('loading'); setProgressLog([]); setError(null); runAnalysis(companyName); }}
              className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────
  const decisionColor =
    result?.decision === 'INVEST'       ? 'var(--success)' :
    result?.decision === 'WATCH'        ? 'var(--accent-primary)' :
    result?.decision === 'PASS'         ? 'var(--danger)' : 'var(--warning)';

  const decisionLabel =
    result?.decision === 'INVEST'       ? 'Invest' :
    result?.decision === 'WATCH'        ? 'Watch' :
    result?.decision === 'PASS'         ? 'Pass' : 'Inconclusive';

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>

      {/* ── Sticky Nav ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(9, 9, 11, 0.85)', backdropFilter: 'blur(12px)',
        width: '100%',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => navigate('/')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 8,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
            }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#52525b'; e.currentTarget.style.color = 'var(--text-primary)'; }}
               onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{companyName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: decisionColor,
              }} />
              <span style={{
                fontSize: 13, fontWeight: 500, color: decisionColor, letterSpacing: '0.02em',
              }}>
              {decisionLabel}
              </span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            <button
              onClick={() => { setStatus('loading'); setProgressLog([]); setResult(null); runAnalysis(companyName); }}
              title="Re-analyze"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Body ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Tab Bar ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'inline-flex', gap: 4, padding: 4,
          borderRadius: 8, marginBottom: 40,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 6,
                fontSize: 13, fontWeight: 500,
                color: activeTab === tab.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                background: activeTab === tab.id ? 'var(--text-primary)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────────── */}
        {activeTab === 'overview' && <AnalysisCard result={result} />}

        {activeTab === 'evidence' && (
          <div className="fade-in">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderRadius: 8, marginBottom: 24,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Evidence Coverage
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {result?.findings?.filter((f) => f.isVerified).length || 0} verified
                </span>
                <strong style={{ fontSize: 14, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {result?.evidenceCoverage}%
                </strong>
              </div>
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
          marginTop: 64, paddingTop: 24,
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: 16, fontSize: 12, color: 'var(--text-muted)',
        }}>
          <span>Analysis completed in {((result?.durationMs || 0) / 1000).toFixed(1)}s</span>
          <span>{result?.analyzedAt ? new Date(result.analyzedAt).toLocaleString() : ''}</span>
          <span>Not financial advice</span>
        </div>
      </div>
    </div>
  );
}
