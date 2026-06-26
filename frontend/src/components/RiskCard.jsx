import { ShieldAlert, TrendingDown, Target, Building, AlertCircle, FileSearch, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

const RISK_TYPES = {
  competition: { label: 'Competition',  icon: <Target size={16} /> },
  regulatory:  { label: 'Regulatory',   icon: <Building size={16} /> },
  financial:   { label: 'Financial',    icon: <TrendingDown size={16} /> },
  operational: { label: 'Operational',  icon: <AlertCircle size={16} /> },
  market:      { label: 'Market',       icon: <ShieldAlert size={16} /> },
  data_risk:   { label: 'Data Gap',     icon: <FileSearch size={16} /> },
  data_gap:    { label: 'Data Gap',     icon: <FileSearch size={16} /> },
};

function RiskMeter({ score }) {
  const color = score >= 61 ? 'var(--danger)' : score >= 41 ? 'var(--warning)' : score >= 21 ? 'var(--accent-primary)' : 'var(--success)';
  const label = score >= 81 ? 'CRITICAL RISK' : score >= 61 ? 'HIGH RISK' : score >= 41 ? 'ELEVATED RISK' : score >= 21 ? 'MODERATE RISK' : 'LOW RISK';

  return (
    <div className="flat-card" style={{ padding: '32px 40px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
          Composite Risk Score
        </p>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
          background: 'var(--bg-primary)', color, border: '1px solid var(--border)',
          letterSpacing: '0.05em'
        }}>{label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 48, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {score}
        </span>
        <span style={{ fontSize: 16, color: 'var(--text-muted)', paddingBottom: 6 }}>/100</span>
      </div>

      <div className="progress-bar-flat" style={{ marginBottom: 12 }}>
        <div className="progress-fill-flat" style={{ width: `${score}%`, background: color }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Low Risk</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>High Risk</span>
      </div>
    </div>
  );
}

function RiskItem({ risk, index }) {
  const isDataGap = risk.type === 'data_risk' || risk.type === 'data_gap';
  const meta = RISK_TYPES[risk.type] || { label: risk.type || 'Risk', icon: <AlertCircle size={16} /> };
  const severity = risk.severity || 'medium';
  
  const severityColor = severity === 'high' ? 'var(--danger)' : severity === 'medium' ? 'var(--warning)' : 'var(--success)';
  const rowClass = severity === 'high' ? 'risk-row-high' : severity === 'medium' ? 'risk-row-medium' : 'risk-row-low';

  if (isDataGap) {
    return (
      <div
        className="fade-in"
        style={{
          display: 'flex', gap: 12, padding: '16px 20px', borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)',
          animationDelay: `${index * 0.05}s`,
        }}
      >
        <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{meta.icon}</div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            DATA GAP · {risk.title}
          </span>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4, margin: 0 }}>
            {risk.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`risk-row fade-in ${rowClass}`}
      style={{ padding: '24px', animationDelay: `${index * 0.05}s` }}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ color: severityColor, marginTop: 2 }}>{meta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {meta.label}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
              color: severityColor, border: '1px solid var(--border)',
            }}>
              {severity.toUpperCase()}
            </span>
            {!risk.hasQuantitativeImpact && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                color: 'var(--text-secondary)', border: '1px solid var(--border)',
              }}>
                OBSERVATION
              </span>
            )}
          </div>

          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', margin: 0 }}>
            {risk.title}
          </h4>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {risk.description}
          </p>
          
          {risk.mitigatingFactors && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 6, fontSize: 13,
              background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-start'
            }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ lineHeight: 1.5 }}>{risk.mitigatingFactors}</span>
            </div>
          )}

          {risk.sourceUrls && risk.sourceUrls.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {risk.sourceUrls.slice(0, 3).map((url, i) => {
                let host = url;
                try { host = new URL(url).hostname.replace('www.', ''); } catch {}
                return (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)',
                      textDecoration: 'none', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = '#52525b'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <LinkIcon size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, whiteSpace: 'nowrap' }}>{host}</span>
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

export default function RiskCard({ riskAnalysis }) {
  if (!riskAnalysis) return null;

  const { risks = [], riskScore = 0, summary } = riskAnalysis;

  // Split into actionable risks vs data gaps
  const actualRisks = risks.filter((r) => r.type !== 'data_risk' && r.type !== 'data_gap');
  const dataGaps = risks.filter((r) => r.type === 'data_risk' || r.type === 'data_gap');

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      <RiskMeter score={riskScore} />

      {summary && (
        <div className="fade-in-delay-1" style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
            {summary}
          </p>
        </div>
      )}

      <div className="fade-in-delay-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <ShieldAlert size={18} color="var(--text-muted)" />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>
            Risk Indicators ({actualRisks.length})
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {actualRisks.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic', padding: 16 }}>
              No specific risks identified.
            </p>
          ) : (
            actualRisks.map((risk, idx) => (
              <RiskItem key={idx} risk={risk} index={idx} />
            ))
          )}
        </div>
      </div>

      {dataGaps.length > 0 && (
        <div className="fade-in-delay-2" style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <FileSearch size={18} color="var(--text-muted)" />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>
              Information Gaps ({dataGaps.length})
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dataGaps.map((gap, idx) => (
              <RiskItem key={idx} risk={gap} index={idx} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
