import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ArrowRight, Activity } from 'lucide-react';
import MemoryHistory from '../components/MemoryHistory';

const EXAMPLE_COMPANIES = [
  'Apple Inc', 'Tesla', 'OpenAI', 'Stripe', 'SpaceX',
  'Nvidia', 'Microsoft', 'Anthropic', 'Databricks', 'Palantir',
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
    <div className="bg-subtle-grid" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        padding: '24px 0',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} color="var(--text-primary)" />
            <span style={{ fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              SkiesInvest
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
            System Operational
          </div>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="bg-soft-glow" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', paddingBottom: '100px' }}>
        
        <div style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>
          
          <div className="fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
            Investment Intelligence
          </div>

          <h1 className="fade-in-delay-1" style={{ fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24 }}>
            Research any company using AI-powered financial analysis.
          </h1>

          <p className="fade-in-delay-2" style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 400 }}>
            Make data-driven decisions based on verifiable real-time evidence, market positioning, and financial strength.
          </p>

          <form onSubmit={handleSubmit} className="fade-in-delay-2" style={{ display: 'flex', gap: 12, maxWidth: 540, margin: '0 auto' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                ref={inputRef}
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, OpenAI, Apple..."
                className="input-field-clean"
                style={{ paddingLeft: 48 }}
                required
              />
            </div>
            <button type="submit" disabled={!companyName.trim()} className="btn-primary" style={{ padding: '0 24px', height: '56px' }}>
              Analyze <ArrowRight size={18} />
            </button>
          </form>

          {/* ── Recent History ────────────────────────────────────────────── */}
          {recentHistory.length > 0 && (
            <div className="fade-in-delay-2" style={{ marginTop: 80, textAlign: 'left' }}>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 16, fontWeight: 600 }}>
                Recent Analyses
              </h3>
              <MemoryHistory history={recentHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
