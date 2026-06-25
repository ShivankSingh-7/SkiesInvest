import ConfidenceBar from './ConfidenceBar';

const DECISION_CONFIG = {
  INVEST: {
    badgeClass: 'badge-invest',
    icon: '✅',
    label: 'INVEST',
    color: '#10b981',
    desc: 'Strong evidence supports this investment',
  },
  PASS: {
    badgeClass: 'badge-pass',
    icon: '❌',
    label: 'PASS',
    color: '#f43f5e',
    desc: 'Evidence does not support investment at this time',
  },
  NEED_MORE_DATA: {
    badgeClass: 'badge-need-data',
    icon: '🔶',
    label: 'NEED MORE DATA',
    color: '#f59e0b',
    desc: 'Insufficient verified information to make a confident decision',
  },
};

function ReasoningItem({ reason, index }) {
  const isPos = reason.type === 'positive';
  const isNeg = reason.type === 'negative';
  const color = isPos ? '#10b981' : isNeg ? '#f43f5e' : '#8b5cf6';
  const icon = isPos ? '↑' : isNeg ? '↓' : '→';

  return (
    <div
      className="fade-in"
      style={{
        display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12,
        background: `${color}08`, border: `1px solid ${color}20`,
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <span style={{ color, fontWeight: 800, fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65 }}>
          {reason.point}
        </p>
        {reason.sourceUrls && reason.sourceUrls.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {reason.sourceUrls.slice(0, 3).map((url, i) => {
              let host = url;
              try { host = new URL(url).hostname.replace('www.', ''); } catch {}
              return (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="source-chip medium" style={{ fontSize: 10 }}>
                  <span style={{ fontSize: 9 }}>↗</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>{host}</span>
                </a>
              );
            })}
          </div>
        )}
        {(!reason.sourceUrls || reason.sourceUrls.length === 0) && (
          <span style={{ fontSize: 11, color: 'rgba(244,63,94,0.7)', marginTop: 4, display: 'block' }}>
            No source cited
          </span>
        )}
      </div>
    </div>
  );
}

export default function AnalysisCard({ result }) {
  if (!result) return null;

  const {
    companyName, decision, confidence, informationGap, investmentScore, evidenceCoverage,
    reasoning = [], verifiedFacts = [], unverifiedClaims = [],
    missingInformation = [], committeeSummary, memoryUsed, analysisCount,
    financialAnalysis = {},
  } = result;

  const config = DECISION_CONFIG[decision] || DECISION_CONFIG.NEED_MORE_DATA;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Decision Header Card ──────────────────────────────────────────── */}
      <div className="glass-card fade-in" style={{ padding: '28px 32px' }}>
        {/* Top row: company name + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
              Investment Recommendation
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              {companyName}
            </h1>
            {memoryUsed && (
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 999,
                background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.2)', fontWeight: 600,
              }}>
                🧠 Memory used · Analysis #{analysisCount}
              </span>
            )}
          </div>

          {/* Decision Badge */}
          <div className={config.badgeClass} style={{ padding: '16px 24px', borderRadius: 16, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{config.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em' }}>{config.label}</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {config.desc}
        </p>

        {/* Committee Summary */}
        {committeeSummary && (
          <div style={{
            padding: '14px 18px', borderRadius: 12, marginBottom: 20, fontSize: 13,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Committee Summary: </strong>
            {committeeSummary}
          </div>
        )}

        {/* Score Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Confidence',   value: confidence,      color: config.color, unit: '%' },
            { label: 'Inv. Score',   value: investmentScore, color: '#3b82f6',    unit: '/100' },
            { label: 'Evidence',     value: evidenceCoverage, color: '#8b5cf6',   unit: '%' },
          ].map(({ label, value, color, unit }) => (
            <div key={label} style={{
              textAlign: 'center', padding: '16px 12px', borderRadius: 14,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color, lineHeight: 1, marginBottom: 4 }}>
                {value}
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 2 }}>{unit}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        <ConfidenceBar value={confidence} informationGap={informationGap} label="Analysis Confidence" />
      </div>

      {/* ── Reasoning ────────────────────────────────────────────────────── */}
      {reasoning.length > 0 && (
        <div className="glass-card fade-in fade-in-delay-1" style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase' }}>
            Decision Reasoning ({reasoning.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reasoning.map((r, i) => <ReasoningItem key={i} reason={r} index={i} />)}
          </div>
        </div>
      )}

      {/* ── Strengths & Weaknesses Grid ───────────────────────────────────── */}
      {(financialAnalysis.strengths?.length > 0 || financialAnalysis.weaknesses?.length > 0) && (
        <div className="fade-in fade-in-delay-2" style={{
          display: 'grid',
          gridTemplateColumns: financialAnalysis.strengths?.length && financialAnalysis.weaknesses?.length
            ? '1fr 1fr' : '1fr',
          gap: 16,
        }}>
          {financialAnalysis.strengths?.length > 0 && (
            <div className="glass-card" style={{ padding: '22px 24px' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 14 }}>
                💪 STRENGTHS ({financialAnalysis.strengths.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {financialAnalysis.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#10b981', fontSize: 10, marginTop: 4, flexShrink: 0 }}>●</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s.point || s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {financialAnalysis.weaknesses?.length > 0 && (
            <div className="glass-card" style={{ padding: '22px 24px' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#fb7185', marginBottom: 14 }}>
                ⚠️ WEAKNESSES ({financialAnalysis.weaknesses.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {financialAnalysis.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#f43f5e', fontSize: 10, marginTop: 4, flexShrink: 0 }}>●</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{w.point || w}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Verified Facts ────────────────────────────────────────────────── */}
      {verifiedFacts.length > 0 && (
        <div className="glass-card fade-in fade-in-delay-3" style={{ padding: '22px 28px' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#34d399', marginBottom: 14, textTransform: 'uppercase' }}>
            ✓ Verified Facts ({verifiedFacts.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {verifiedFacts.map((fact, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
              }}>
                <span style={{ color: '#10b981', flexShrink: 0, fontWeight: 700 }}>✓</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                    {fact.fact || fact}
                  </p>
                  {fact.sourceUrls?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                      {fact.sourceUrls.slice(0, 2).map((url, j) => {
                        let host = url;
                        try { host = new URL(url).hostname.replace('www.', ''); } catch {}
                        return (
                          <a key={j} href={url} target="_blank" rel="noopener noreferrer"
                            className="source-chip high" style={{ fontSize: 10 }}>
                            <span style={{ fontSize: 9 }}>↗</span>
                            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{host}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Unverified Claims ─────────────────────────────────────────────── */}
      {unverifiedClaims.length > 0 && (
        <div className="glass-card fade-in fade-in-delay-4" style={{ padding: '22px 28px' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#fbbf24', marginBottom: 14, textTransform: 'uppercase' }}>
            ⚠️ Unverified Claims ({unverifiedClaims.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unverifiedClaims.map((claim, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, fontWeight: 700 }}>?</span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{claim}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Information Gaps ───────────────────────────────────────────── */}
      {missingInformation.length > 0 && (
        <div className="glass-card fade-in" style={{ padding: '22px 28px' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#fb7185', marginBottom: 8, textTransform: 'uppercase' }}>
            ❌ Information Gaps ({missingInformation.length})
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            The following data could not be verified from available sources.
            These gaps do not decrease our confidence in the verified facts above.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {missingInformation.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)',
              }}>
                <span style={{ color: '#f43f5e', flexShrink: 0, fontWeight: 700 }}>✕</span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
