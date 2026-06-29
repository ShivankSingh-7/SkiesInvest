import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react';

const DECISION_COLORS = {
  INVEST: 'var(--success)',
  PASS: 'var(--danger)',
  NEED_MORE_DATA: 'var(--warning)',
};

const DECISION_ICONS = {
  INVEST: <CheckCircle size={14} />,
  PASS: <XCircle size={14} />,
  NEED_MORE_DATA: <AlertCircle size={14} />,
};

const DECISION_LABELS = {
  INVEST: 'INVEST',
  PASS: 'PASS',
  NEED_MORE_DATA: 'INCONCLUSIVE',
};

export default function MemoryHistory({ history = [] }) {
  const navigate = useNavigate();

  if (!history || history.length === 0) {
    return (
      <div className="flat-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Database size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          No Previous Analyses
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Analyzed companies will appear here for quick reference.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {history.map((item, i) => {
        const decision = item.previousAnalysis?.decision || 'NEED_MORE_DATA';
        const color = DECISION_COLORS[decision] || 'var(--text-muted)';
        const icon = DECISION_ICONS[decision] || <AlertCircle size={14} />;
        const ms = Date.now() - new Date(item.lastUpdated).getTime();
        const daysAgo = Math.floor(ms / (1000 * 60 * 60 * 24));

        return (
          <div
            key={i}
            className="flat-card fade-in"
            style={{
              padding: '16px 20px', cursor: 'pointer',
              animationDelay: `${i * 0.04}s`,
            }}
            onClick={() =>
              navigate('/', { state: { prefill: item.displayName || item.companyName } })
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
                }}>
                  <Building2 size={20} />
                </div>

                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px 0' }}>
                    <p style={{
                      fontWeight: 600, fontSize: 15, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0
                    }}>
                      {item.displayName || item.companyName}
                    </p>
                    {item.companyStatus && (String(item.companyStatus).toLowerCase().includes('private') || String(item.companyStatus).toLowerCase().includes('unlisted') || String(item.companyStatus).toLowerCase().includes('not listed')) && (
                      <span style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)',
                        border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        Not Listed
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color }}>
                      {icon}
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
                        {DECISION_LABELS[decision] || decision}
                      </span>
                    </div>
                    <span style={{ color: 'var(--border)', fontSize: 10 }}>|</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score + count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                {item.previousAnalysis?.investmentScore !== undefined && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Score</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color, margin: 0, letterSpacing: '-0.02em' }}>
                      {item.previousAnalysis.investmentScore}/100
                    </p>
                  </div>
                )}
                {item.analysisCount > 1 && (
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)', fontWeight: 500,
                  }}>
                    {item.analysisCount}x
                  </span>
                )}
                <ChevronRight size={18} color="var(--text-muted)" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
