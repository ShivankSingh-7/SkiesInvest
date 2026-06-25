import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, TrendingUp, Shield, Brain, Zap, Clock } from 'lucide-react';
import MemoryHistory from '../components/MemoryHistory';

const EXAMPLE_COMPANIES = [
  'Apple Inc', 'Tesla', 'OpenAI', 'Stripe', 'SpaceX',
  'Nvidia', 'Microsoft', 'Anthropic', 'Databricks', 'Palantir',
];

const FEATURES = [
  { icon: Brain, title: 'Evidence-Based AI', desc: 'Every claim is sourced from real articles. No hallucinations.' },
  { icon: Shield, title: 'Confidence Scoring', desc: 'Each finding rated by source quality and count.' },
  { icon: TrendingUp, title: 'Investment Committee', desc: 'INVEST / PASS / NEED_MORE_DATA — never forced.' },
  { icon: Zap, title: 'Long-Term Memory', desc: 'Remembers past analyses and detects changes over time.' },
];

export default function LandingPage() {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  // Auto-fill from memory history click
  useEffect(() => {
    if (location.state?.prefill) {
      setCompanyName(location.state.prefill);
      inputRef.current?.focus();
    }
  }, [location.state]);

  // Load recent analyses on mount
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

  const handleExample = (name) => {
    setCompanyName(name);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-animated dot-grid">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav
        className="border-b flex items-center justify-between px-6 py-4"
        style={{ borderColor: 'var(--border)', background: 'rgba(5,13,26,0.8)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
          >
            <TrendingUp size={16} color="white" />
          </div>
          <span className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>
            Skies<span className="gradient-text">Invest</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          AI Agents Active
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="text-center mb-14 fade-in">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#60a5fa',
            }}
          >
            <Brain size={12} />
            LangGraph Multi-Agent System · Powered by Groq
          </div>

          <h1 className="font-black mb-4 leading-tight" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
            <span className="gradient-text">AI Investment</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Research Agent</span>
          </h1>

          <p
            className="text-lg max-w-xl mx-auto mb-3"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
          >
            Evidence-based investment research. Every claim is sourced.
            Every recommendation is justified.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Returns <strong style={{ color: '#34d399' }}>INVEST</strong>,{' '}
            <strong style={{ color: '#fb7185' }}>PASS</strong>, or{' '}
            <strong style={{ color: '#fbbf24' }}>NEED MORE DATA</strong> — never hallucinated answers.
          </p>
        </div>

        {/* ── Search Form ──────────────────────────────────────────────────── */}
        <div className="glass-card p-8 mb-10 fade-in fade-in-delay-1">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="company-input"
              className="block text-sm font-semibold mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              COMPANY NAME
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search
                  size={18}
                  style={{
                    position: 'absolute', left: '16px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                  }}
                />
                <input
                  ref={inputRef}
                  id="company-input"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apple Inc, Tesla, OpenAI..."
                  className="input-field"
                  style={{ paddingLeft: '46px' }}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <button
                id="analyze-btn"
                type="submit"
                className="btn-primary"
                disabled={isLoading || !companyName.trim()}
                style={{ whiteSpace: 'nowrap', minWidth: '140px' }}
              >
                <span className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="pulse-dot" style={{ background: 'white' }} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Analyze
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Examples */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: '24px' }}>
                Try:
              </span>
              {EXAMPLE_COMPANIES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleExample(name)}
                  className="text-xs px-3 py-1 rounded-full transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'rgba(59,130,246,0.4)';
                    e.target.style.color = '#60a5fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* ── Features Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 fade-in fade-in-delay-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-4 text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <Icon size={18} style={{ color: '#60a5fa' }} />
              </div>
              <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Recent Analyses ──────────────────────────────────────────────── */}
        {recentHistory.length > 0 && (
          <div className="fade-in fade-in-delay-3">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                RECENT ANALYSES
              </h2>
            </div>
            <MemoryHistory history={recentHistory} />
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="border-t text-center py-6 text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        SkiesInvest · AI Investment Research · Not financial advice ·{' '}
        <a
          href="https://github.com/ShivankSingh-7/SkiesInvest"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#60a5fa' }}
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
