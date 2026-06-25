import { ExternalLink } from 'lucide-react';

const RISK_TYPE_LABELS = {
  competition: { label: 'Competition', icon: '⚔️' },
  regulatory: { label: 'Regulatory', icon: '⚖️' },
  financial: { label: 'Financial', icon: '💸' },
  operational: { label: 'Operational', icon: '⚙️' },
  market: { label: 'Market', icon: '📉' },
  data_risk: { label: 'Data Risk', icon: '❓' },
};

function RiskMeter({ score }) {
  const color =
    score >= 70 ? '#f43f5e' : score >= 40 ? '#f59e0b' : '#10b981';
  const label =
    score >= 70 ? 'HIGH RISK' : score >= 40 ? 'MODERATE RISK' : 'LOW RISK';

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          COMPOSITE RISK SCORE
        </h3>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            background: `${color}20`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-end gap-4">
        <span
          className="text-5xl font-black font-mono"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          / 100
        </span>
        <div className="flex-1 mb-2">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${score}%`,
                background: `linear-gradient(90deg, ${color}80, ${color})`,
                boxShadow: `0 0 10px ${color}50`,
                transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: '#10b981' }}>Low Risk</span>
            <span className="text-xs" style={{ color: '#f43f5e' }}>High Risk</span>
          </div>
        </div>
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        0 = Very safe investment · 100 = Extreme risk
      </p>
    </div>
  );
}

function RiskItem({ risk, index }) {
  const meta = RISK_TYPE_LABELS[risk.type] || { label: risk.type, icon: '⚠️' };
  const severityColor =
    risk.severity === 'high' ? '#f43f5e' :
    risk.severity === 'medium' ? '#f59e0b' : '#10b981';

  return (
    <div
      className={`p-4 rounded-xl risk-${risk.severity || 'medium'} fade-in`}
      style={{ animationDelay: `${index * 0.07}s`, opacity: 0 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {meta.label}
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${severityColor}15`,
                color: severityColor,
                border: `1px solid ${severityColor}30`,
              }}
            >
              {risk.severity?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>
          <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {risk.title}
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {risk.description}
          </p>
          {risk.mitigatingFactors && (
            <p className="text-xs mt-2 p-2 rounded" style={{
              background: 'rgba(16,185,129,0.06)',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.15)',
            }}>
              ✓ {risk.mitigatingFactors}
            </p>
          )}
          {risk.sourceUrls && risk.sourceUrls.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {risk.sourceUrls.slice(0, 3).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-chip low"
                  style={{ fontSize: '10px' }}
                >
                  <ExternalLink size={8} />
                  <span className="truncate" style={{ maxWidth: '120px' }}>
                    {new URL(url).hostname.replace('www.', '')}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiskCard({ riskAnalysis = {} }) {
  const { risks = [], riskScore = 50, riskSummary = '' } = riskAnalysis;

  const highRisks = risks.filter((r) => r.severity === 'high');
  const medRisks = risks.filter((r) => r.severity === 'medium');
  const lowRisks = risks.filter((r) => r.severity === 'low');

  return (
    <div>
      <RiskMeter score={riskScore} />

      {riskSummary && (
        <div
          className="glass-card p-4 mb-6 text-sm"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
        >
          {riskSummary}
        </div>
      )}

      {risks.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p style={{ color: 'var(--text-secondary)' }}>No specific risks identified</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...highRisks, ...medRisks, ...lowRisks].map((risk, i) => (
            <RiskItem key={i} risk={risk} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
