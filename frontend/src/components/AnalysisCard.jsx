import ConfidenceBar from './ConfidenceBar';

const DECISION_CONFIG = {
  INVEST: {
    icon: '↑',
    label: 'INVEST',
    sublabel: 'Strong opportunity',
    color: '#10b981',
    desc: 'Strong evidence supports this investment',
  },
  WATCH: {
    icon: '◎',
    label: 'WATCH',
    sublabel: 'Monitor closely',
    color: '#60a5fa',
    desc: 'Promising signals with some uncertainty — worth monitoring',
  },
  PASS: {
    icon: '↓',
    label: 'PASS',
    sublabel: 'Not recommended',
    color: '#f43f5e',
    desc: 'Verified evidence does not support investment at this time',
  },
  INCONCLUSIVE: {
    icon: '—',
    label: 'INCONCLUSIVE',
    sublabel: 'Insufficient data',
    color: '#f59e0b',
    desc: 'Not enough publicly verifiable information for a meaningful opinion',
  },
  // backwards-compat alias
  NEED_MORE_DATA: {
    icon: '—',
    label: 'INCONCLUSIVE',
    sublabel: 'Insufficient data',
    color: '#f59e0b',
    desc: 'Not enough publicly verifiable information for a meaningful opinion',
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
    missingInformation = [], informationGaps = [],
    summary, committeeSummary,
    memoryUsed, analysisCount,
    financialAnalysis = {},
  } = result;

  // Use new summary field, fall back to old committeeSummary
  const displaySummary = summary || committeeSummary || '';
  // Use new informationGaps field, fall back to old missingInformation
  const displayGaps = informationGaps.length > 0 ? informationGaps : missingInformation;

  const config = DECISION_CONFIG[decision] || DECISION_CONFIG.INCONCLUSIVE;

  // Compute donut chart segments
  const verifiedPct = Math.min(100, Math.round(confidence));
  const unverifiedPct = Math.min(100 - verifiedPct, Math.round((unverifiedClaims.length / Math.max(1, verifiedFacts.length + unverifiedClaims.length + displayGaps.length)) * 100));
  const missingPct = Math.max(0, 100 - verifiedPct - unverifiedPct);

  // Build SVG donut (r=40, circumference ≈ 251.3)
  const R = 40;
  const C = 2 * Math.PI * R;
  const segments = [
    { pct: verifiedPct,   color: config.color,  label: 'Verified' },
    { pct: unverifiedPct, color: '#f59e0b',       label: 'Unverified' },
    { pct: missingPct,    color: 'rgba(255,255,255,0.1)', label: 'Missing' },
  ];
  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = (seg.pct / 100) * C;
    const gap = C - dash;
    const arc = { ...seg, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Decision Header Card ──────────────────────────────────────────── */}
      <div className="glass-card fade-in" style={{ padding: '28px 32px' }}>

        {/* Top row: company name + decision pill */}
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

          {/* Slim decision pill — no more big badge */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '14px 22px', borderRadius: 14, flexShrink: 0,
            background: `${config.color}10`, border: `1px solid ${config.color}30`,
          }}>
            <span style={{ fontSize: 26, lineHeight: 1, marginBottom: 6 }}>{config.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: config.color, letterSpacing: '0.05em' }}>{config.label}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{config.sublabel}</span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {config.desc}
        </p>

        {/* Committee Summary */}
        {displaySummary && (
          <div style={{
            padding: '14px 18px', borderRadius: 12, marginBottom: 20, fontSize: 13,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Committee Summary: </strong>
            {displaySummary}
          </div>
        )}

        {/* Score + Donut Layout */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'stretch', flexWrap: 'wrap', marginBottom: 20 }}>

          {/* Score tiles */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
            {[
              { label: 'Evidence Confidence', value: confidence, color: config.color, unit: '%', sub: 'Based on verified sources only' },
              { label: 'Investment Score',     value: investmentScore, color: '#3b82f6', unit: '/100', sub: 'Overall investment quality' },
              { label: 'Evidence Coverage',    value: evidenceCoverage, color: '#8b5cf6', unit: '%', sub: 'Research topic coverage' },
            ].map(({ label, value, color, unit, sub }) => (
              <div key={label} style={{
                padding: '14px 16px', borderRadius: 14, flex: 1,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color, lineHeight: 1, flexShrink: 0 }}>
                  {value ?? '—'}
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 2 }}>{unit}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Donut chart — evidence breakdown */}
          <div style={{
            padding: '20px 24px', borderRadius: 14, flexShrink: 0,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 180,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>
              Data Breakdown
            </p>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
              {arcs.map((arc, i) => arc.pct > 0 && (
                <circle
                  key={i}
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="14"
                  strokeDasharray={`${arc.dash} ${arc.gap}`}
                  strokeDashoffset={-arc.offset}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              ))}
              <text x="50" y="46" textAnchor="middle" fill={config.color} fontSize="15" fontWeight="900" fontFamily="monospace">
                {verifiedPct}%
              </text>
              <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter, sans-serif">
                verified
              </text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 14, width: '100%' }}>
              {[
                { color: config.color, label: 'Verified', pct: verifiedPct },
                { color: '#f59e0b', label: 'Unverified', pct: unverifiedPct },
                { color: 'rgba(255,255,255,0.2)', label: 'Missing', pct: missingPct },
              ].map(({ color, label, pct }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ConfidenceBar value={confidence} informationGap={informationGap} label="Evidence Confidence" />
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

      {/* ── Information Gaps ──────────────────────────────────────────────── */}
      {displayGaps.length > 0 && (
        <div className="glass-card fade-in" style={{ padding: '22px 28px' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#f59e0b', marginBottom: 8, textTransform: 'uppercase' }}>
            🔍 Information Gaps ({displayGaps.length})
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            The following data could not be verified from available sources.
            These gaps are tracked separately and do not reduce confidence in verified evidence.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayGaps.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
              }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, fontSize: 12 }}>‒</span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
