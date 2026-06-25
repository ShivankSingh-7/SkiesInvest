import { useNavigate } from 'react-router-dom';

const DECISION_COLORS = {
  INVEST: '#10b981',
  PASS: '#f43f5e',
  NEED_MORE_DATA: '#f59e0b',
};

const DECISION_LABELS = {
  INVEST: '✅ INVEST',
  PASS: '❌ PASS',
  NEED_MORE_DATA: '🔶 NEED MORE DATA',
};

export default function MemoryHistory({ history = [] }) {
  const navigate = useNavigate();

  if (!history || history.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 36, marginBottom: 10 }}>🧠</p>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          No Previous Analyses
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Analyzed companies will appear here for quick reference
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {history.map((item, i) => {
        const decision = item.previousAnalysis?.decision || 'NEED_MORE_DATA';
        const color = DECISION_COLORS[decision] || '#8b5cf6';
        const ms = Date.now() - new Date(item.lastUpdated).getTime();
        const daysAgo = Math.floor(ms / (1000 * 60 * 60 * 24));

        return (
          <div
            key={i}
            className="glass-card fade-in"
            style={{
              padding: '16px 20px', cursor: 'pointer',
              animationDelay: `${i * 0.06}s`,
            }}
            onClick={() =>
              navigate('/', { state: { prefill: item.displayName || item.companyName } })
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: `${color}15`, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>🏢</div>

                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontWeight: 600, fontSize: 14, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.displayName || item.companyName}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{DECISION_LABELS[decision] || decision}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      🕐 {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score + count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {item.previousAnalysis?.investmentScore !== undefined && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Score</p>
                    <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color }}>
                      {item.previousAnalysis.investmentScore}/100
                    </p>
                  </div>
                )}
                {item.analysisCount > 1 && (
                  <span style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 999,
                    background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                    border: '1px solid rgba(139,92,246,0.2)', fontWeight: 600,
                  }}>
                    {item.analysisCount}×
                  </span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>›</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
