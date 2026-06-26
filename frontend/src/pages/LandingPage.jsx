import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MemoryHistory from '../components/MemoryHistory';

const EXAMPLE_COMPANIES = [
  'Apple Inc', 'Tesla', 'OpenAI', 'Stripe', 'SpaceX',
  'Nvidia', 'Microsoft', 'Anthropic', 'Databricks', 'Palantir',
];

const FEATURES = [
  { icon: '🧠', title: 'Evidence-Based AI', desc: 'Every claim is sourced from real articles. No hallucinations.' },
  { icon: '🛡️', title: 'Confidence Scoring', desc: 'Each finding rated by source quality and verification count.' },
  { icon: '📈', title: 'Investment Committee', desc: 'INVEST / PASS / NEED_MORE_DATA — never forced.' },
  { icon: '⚡', title: 'Long-Term Memory', desc: 'Remembers past analyses and detects changes over time.' },
];

export default function LandingPage() {
  const [companyName, setCompanyName] = useState('');
  const [recentHistory, setRecentHistory] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  useEffect(() => {
    if (location.state?.prefill) {
      setCompanyName(location.state.prefill);
      inputRef.current?.focus();
    }
  }, [location.state]);

  useEffect(() => {
    fetch('/api/recent')
      .then((r) => r.json())
      .then((data) => setRecentHistory(data.analyses || []))
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = companyName.trim();
    if (!trimmed || trimmed.length < 2) return;
    navigate('/result', { state: { companyName: trimmed } });
  };

  return (
    <div className="bg-animated dot-grid" style={{ minHeight: '100vh', width: '100%' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(5,13,26,0.85)',
        backdropFilter: 'blur(14px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>📈</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
              Skies<span className="gradient-text">Invest</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 7px #10b981' }} />
            AI Agents Active
          </div>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* ── Hero Section ────────────────────────────────────────────── */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999, marginBottom: 28,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
            color: '#60a5fa', fontSize: 12, fontWeight: 600,
          }}>
            🤖 LangGraph Multi-Agent System · Powered by Groq llama-3.3-70b
          </div>

          <h1 style={{
            fontWeight: 900, lineHeight: 1.15, marginBottom: 20,
            fontSize: 'clamp(38px, 5.5vw, 64px)',
            color: 'var(--text-primary)',
          }}>
            <span className="gradient-text">AI Investment</span>
            <br />Research Agent
          </h1>

          <p style={{
            fontSize: 18, color: 'var(--text-secondary)',
            maxWidth: 520, margin: '0 auto 14px', lineHeight: 1.75,
          }}>
            Evidence-based investment research. Every claim is sourced.
            Every recommendation is justified by real data.
          </p>

          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Returns{' '}
            <strong style={{ color: '#34d399' }}>INVEST</strong>,{' '}
            <strong style={{ color: '#fb7185' }}>PASS</strong>, or{' '}
            <strong style={{ color: '#fbbf24' }}>NEED MORE DATA</strong>{' '}
            — never hallucinated answers.
          </p>
        </div>

        {/* ── Search Form Card ─────────────────────────────────────────── */}
        <div className="glass-card fade-in fade-in-delay-1" style={{ padding: '36px 40px', marginBottom: 40 }}>
          <label htmlFor="company-input" style={{
            display: 'block', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', color: 'var(--text-muted)',
            marginBottom: 12, textTransform: 'uppercase',
          }}>
            Company Name
          </label>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%',
                  transform: 'translateY(-50%)', fontSize: 16,
                  pointerEvents: 'none',
                }}>🔍</span>
                <input
                  ref={inputRef}
                  id="company-input"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apple Inc, Tesla, OpenAI, Stripe..."
                  className="input-field"
                  style={{ paddingLeft: 46 }}
                  autoFocus
                />
              </div>
              <button
                id="analyze-btn"
                type="submit"
                className="btn-primary"
                disabled={!companyName.trim()}
                style={{ minWidth: 140, flexShrink: 0 }}
              >
                ⚡ Analyze
              </button>
            </div>

            {/* Example chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try:</span>
              {EXAMPLE_COMPANIES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { setCompanyName(name); inputRef.current?.focus(); }}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'var(--text-secondary)',
                    borderRadius: 999, padding: '4px 12px',
                    fontSize: 12, cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                    e.currentTarget.style.color = '#60a5fa';
                    e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* ── Features Grid ────────────────────────────────────────────── */}
        <div className="fade-in fade-in-delay-2" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 16,
          marginBottom: 56,
        }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="glass-card" style={{ padding: '22px 20px', textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, margin: '0 auto 14px',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{icon}</div>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Agent Pipeline Preview ────────────────────────────────────── */}
        <div className="glass-card fade-in fade-in-delay-3" style={{ padding: '28px 32px', marginBottom: 40 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase' }}>
            AI Agent Pipeline
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', rowGap: 12 }}>
            {['🧠 Memory', '🔍 Collect', '🧩 Consolidate', '📊 Evidence', '💰 Financial', '⚠️ Risk', '⚖️ Decision'].map((step, i, arr) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  color: '#60a5fa', whiteSpace: 'nowrap',
                }}>
                  {step}
                </div>
                {i < arr.length - 1 && (
                  <span style={{ color: 'var(--text-muted)', margin: '0 6px', fontSize: 14 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Analyses ───────────────────────────────────────────── */}
        {recentHistory.length > 0 && (
          <div className="fade-in fade-in-delay-4">
            <h2 style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              🕐 Recent Analyses
            </h2>
            <MemoryHistory history={recentHistory} />
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center', padding: '20px 24px',
        fontSize: 12, color: 'var(--text-muted)',
      }}>
        SkiesInvest · AI Investment Research · Not financial advice ·{' '}
        <a href="https://github.com/ShivankSingh-7/SkiesInvest" target="_blank" rel="noopener noreferrer"
          style={{ color: '#60a5fa', textDecoration: 'none' }}>GitHub ↗</a>
      </footer>
    </div>
  );
}
