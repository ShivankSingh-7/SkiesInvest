import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, BarChart2, ChevronRight } from 'lucide-react';

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
      <div className="glass-card p-8 text-center">
        <p className="text-3xl mb-3">🧠</p>
        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          No Previous Analyses
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Analyzed companies will appear here for quick reference
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item, i) => {
        const decision = item.previousAnalysis?.decision || 'NEED_MORE_DATA';
        const color = DECISION_COLORS[decision] || '#8b5cf6';
        const daysAgo = Math.floor(
          (Date.now() - new Date(item.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div
            key={i}
            className="glass-card p-4 cursor-pointer fade-in"
            style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            onClick={() => {
              // Navigate to a new analysis of this company
              navigate('/', { state: { prefill: item.displayName || item.companyName } });
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <span className="text-lg">🏢</span>
                </div>
                <div className="min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.displayName || item.companyName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold" style={{ color }}>
                      {DECISION_LABELS[decision] || decision}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>·</span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={10} />
                      {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {item.previousAnalysis?.investmentScore !== undefined && (
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Score</p>
                    <p className="text-sm font-bold font-mono" style={{ color }}>
                      {item.previousAnalysis.investmentScore}/100
                    </p>
                  </div>
                )}
                {item.analysisCount > 1 && (
                  <div
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(139,92,246,0.1)',
                      color: '#a78bfa',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}
                  >
                    {item.analysisCount}x
                  </div>
                )}
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
