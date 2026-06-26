const RISK_TYPES = {
  competition: { label: 'Competition',  icon: '⚔️' },
  regulatory:  { label: 'Regulatory',   icon: '⚖️' },
  financial:   { label: 'Financial',    icon: '💸' },
  operational: { label: 'Operational',  icon: '⚙️' },
  market:      { label: 'Market',       icon: '📉' },
  data_risk:   { label: 'Data Gap',     icon: '🔍' },
  data_gap:    { label: 'Data Gap',     icon: '🔍' },
};

function RiskMeter({ score }) {
  const color = score >= 61 ? '#f43f5e' : score >= 41 ? '#f59e0b' : score >= 21 ? '#60a5fa' : '#10b981';
  const label = score >= 81 ? 'CRITICAL RISK' : score >= 61 ? 'HIGH RISK' : score >= 41 ? 'ELEVATED RISK' : score >= 21 ? 'MODERATE RISK' : 'LOW RISK';

  return (
    <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Composite Risk Score
        </p>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
          background: `${color}18`, color, border: `1px solid ${color}35`,
        }}>{label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 12 }}>
        <span style={{ fontSize: 52, fontWeight: 900, fontFamily: 'monospace', color, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>/100</span>
        <div style={{ flex: 1, marginBottom: 8 }}>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${score}%`,
                background: `linear-gradient(90deg, ${color}80, ${color})`,
                boxShadow: `0 0 10px ${color}50`,
                transition: 'width 1.3s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: '#10b981' }}>Low Risk</span>
            <span style={{ fontSize: 10, color: '#f43f5e' }}>High Risk</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        0 = Very safe investment · 100 = Extreme risk — avoid
      </p>
    </div>
  );
}

function RiskItem({ risk, index }) {
  const isDataGap = risk.type === 'data_risk' || risk.type === 'data_gap';
  const meta = RISK_TYPES[risk.type] || { label: risk.type || 'Risk', icon: '⚠️' };
  const severity = risk.severity || 'medium';
  const severityColor = severity === 'high' ? '#f43f5e' : severity === 'medium' ? '#f59e0b' : '#10b981';

  // Data gaps rendered as a subtle informational row, not as alarming risk cards
  if (isDataGap) {
    return (
      <div
        className="fade-in"
        style={{
          display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          animationDelay: `${index * 0.06}s`,
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1, opacity: 0.6 }}>🔍</span>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
            DATA GAP · {risk.title}
          </span>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 2 }}>
            {risk.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`risk-${severity} fade-in`}
      style={{ padding: '16px 20px', marginBottom: 0, animationDelay: `${index * 0.06}s` }}
    >
      <div style={{ display: 'flex', gap: 14 }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {meta.label}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
              background: `${severityColor}15`, color: severityColor,
              border: `1px solid ${severityColor}30`,
            }}>
              {severity.toUpperCase()}
            </span>
            {!risk.hasQuantitativeImpact && (
              <span style={{
                fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.2)',
              }}>
                INDICATOR
              </span>
            )}
          </div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
            {risk.title}
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {risk.description}
          </p>
          {risk.mitigatingFactors && (
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 8, fontSize: 12,
              background: 'rgba(16,185,129,0.07)', color: '#34d399',
              border: '1px solid rgba(16,185,129,0.18)',
            }}>
              ✓ {risk.mitigatingFactors}
            </div>
          )}
          {risk.sourceUrls && risk.sourceUrls.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {risk.sourceUrls.slice(0, 3).map((url, i) => {
                let host = url;
                try { host = new URL(url).hostname.replace('www.', ''); } catch {}
                return (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="source-chip low" style={{ fontSize: 10 }}>
                    <span style={{ fontSize: 9 }}>↗</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{host}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiskCard({ riskAnalysis = {} }) {
  const { risks = [], riskScore = 50, riskSummary = '' } = riskAnalysis;

  // Separate real risks from data gap notes
  const businessRisks = risks.filter((r) => r.type !== 'data_risk' && r.type !== 'data_gap');
  const dataGaps = risks.filter((r) => r.type === 'data_risk' || r.type === 'data_gap');

  // Separate quantitative risks from risk indicators
  const quantitativeRisks = businessRisks.filter((r) => r.hasQuantitativeImpact);
  const riskIndicators = businessRisks.filter((r) => !r.hasQuantitativeImpact);

  const sortByPriority = (list) => {
    const high = list.filter((r) => r.severity === 'high');
    const med  = list.filter((r) => r.severity === 'medium');
    const low  = list.filter((r) => r.severity === 'low');
    return [...high, ...med, ...low];
  };
  const sortedQuantitative = sortByPriority(quantitativeRisks);
  const sortedIndicators = sortByPriority(riskIndicators);

  return (
    <div>
      <RiskMeter score={riskScore} />

      {riskSummary && (
        <div className="glass-card" style={{
          padding: '16px 20px', marginBottom: 20, fontSize: 13,
          color: 'var(--text-secondary)', lineHeight: 1.7,
        }}>
          {riskSummary}
        </div>
      )}

      {businessRisks.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ color: 'var(--text-secondary)' }}>No specific risks identified in research</p>
        </div>
      ) : (
        <>
          {/* Quantitative Risks — these affect the composite score */}
          {sortedQuantitative.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)',
                textTransform: 'uppercase', marginBottom: 8,
              }}>
                📊 Quantitative Risks ({sortedQuantitative.length}) — Included in Composite Score
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedQuantitative.map((risk, i) => <RiskItem key={`q-${i}`} risk={risk} index={i} />)}
              </div>
            </div>
          )}

          {/* Risk Indicators — qualitative, NOT in composite score */}
          {sortedIndicators.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)',
                textTransform: 'uppercase', marginBottom: 8,
              }}>
                🔎 Risk Indicators ({sortedIndicators.length}) — Qualitative Observations
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedIndicators.map((risk, i) => <RiskItem key={`i-${i}`} risk={risk} index={i} />)}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic', lineHeight: 1.6 }}>
                These observations are provided for investor awareness and are NOT included in the Financial Risk Score unless supported by measurable financial evidence.
              </p>
            </div>
          )}
        </>
      )}

      {/* Data gaps — shown as a compact, subdued section at the bottom */}
      {dataGaps.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)',
            textTransform: 'uppercase', marginBottom: 8
          }}>
            🔍 Information Gaps ({dataGaps.length}) — Not factored into risk score
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dataGaps.map((risk, i) => <RiskItem key={i} risk={risk} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
