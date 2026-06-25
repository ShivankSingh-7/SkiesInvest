import ConfidenceBar from './ConfidenceBar';
import { ExternalLink, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const DECISION_CONFIG = {
  INVEST: {
    badgeClass: 'badge-invest',
    icon: '✅',
    label: 'INVEST',
    color: '#10b981',
    description: 'Strong evidence supports this investment',
  },
  PASS: {
    badgeClass: 'badge-pass',
    icon: '❌',
    label: 'PASS',
    color: '#f43f5e',
    description: 'Evidence does not support investment at this time',
  },
  NEED_MORE_DATA: {
    badgeClass: 'badge-need-data',
    icon: '🔶',
    label: 'NEED MORE DATA',
    color: '#f59e0b',
    description: 'Insufficient verified information to make a confident decision',
  },
};

function ReasoningItem({ reason, index }) {
  const isPositive = reason.type === 'positive';
  const isNegative = reason.type === 'negative';
  const color = isPositive ? '#10b981' : isNegative ? '#f43f5e' : '#8b5cf6';
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : AlertCircle;

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl fade-in"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}20`,
        animationDelay: `${index * 0.06}s`,
        opacity: 0,
      }}
    >
      <Icon size={15} style={{ color, marginTop: 2, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {reason.point}
        </p>
        {reason.sourceUrls && reason.sourceUrls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {reason.sourceUrls.slice(0, 3).map((url, i) => {
              let hostname = url;
              try { hostname = new URL(url).hostname.replace('www.', ''); } catch {}
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-chip medium"
                  style={{ fontSize: '10px' }}
                >
                  <ExternalLink size={8} />
                  <span className="truncate" style={{ maxWidth: '120px' }}>{hostname}</span>
                </a>
              );
            })}
          </div>
        )}
        {(!reason.sourceUrls || reason.sourceUrls.length === 0) && (
          <span className="text-xs mt-1 block" style={{ color: '#f43f5e', opacity: 0.7 }}>
            No source cited for this point
          </span>
        )}
      </div>
    </div>
  );
}

export default function AnalysisCard({ result }) {
  if (!result) return null;

  const {
    companyName, decision, confidence, investmentScore, evidenceCoverage,
    reasoning = [], verifiedFacts = [], unverifiedClaims = [],
    missingInformation = [], committeeSummary, memoryUsed, analysisCount,
    financialAnalysis = {}, scoreBreakdown = {},
  } = result;

  const config = DECISION_CONFIG[decision] || DECISION_CONFIG.NEED_MORE_DATA;

  return (
    <div className="space-y-6">
      {/* ── Decision Header ────────────────────────────────────────── */}
      <div className="glass-card p-6 fade-in">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              INVESTMENT RECOMMENDATION
            </p>
            <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
              {companyName}
            </h1>
            {memoryUsed && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                🧠 Memory used · Analysis #{analysisCount}
              </span>
            )}
          </div>
          <div className={`px-6 py-3 rounded-2xl text-center ${config.badgeClass}`}>
            <div className="text-2xl mb-0.5">{config.icon}</div>
            <div className="text-sm font-black tracking-wider">{config.label}</div>
          </div>
        </div>

        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          {config.description}
        </p>

        {committeeSummary && (
          <div className="p-4 rounded-xl mb-5 text-sm leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Committee Summary: &nbsp;
            </span>
            {committeeSummary}
          </div>
        )}

        {/* ── Score Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Confidence', value: confidence, color: config.color, unit: '%' },
            { label: 'Inv. Score', value: investmentScore, color: '#3b82f6', unit: '/100' },
            { label: 'Evidence', value: evidenceCoverage, color: '#8b5cf6', unit: '%' },
          ].map(({ label, value, color, unit }) => (
            <div key={label} className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-black font-mono mb-0.5" style={{ color }}>
                {value}{unit === '%' ? '%' : ''}
                {unit === '/100' && <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>/100</span>}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Confidence Bar ───────────────────────────────────────────── */}
        <ConfidenceBar value={confidence} label="Analysis Confidence" />
      </div>

      {/* ── Reasoning ─────────────────────────────────────────────────── */}
      {reasoning.length > 0 && (
        <div className="glass-card p-5 fade-in fade-in-delay-1">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
            DECISION REASONING ({reasoning.length})
          </h2>
          <div className="space-y-2">
            {reasoning.map((reason, i) => (
              <ReasoningItem key={i} reason={reason} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Financial Strengths & Weaknesses ──────────────────────────── */}
      {(financialAnalysis.strengths?.length > 0 || financialAnalysis.weaknesses?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in fade-in-delay-2">
          {/* Strengths */}
          {financialAnalysis.strengths?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold mb-3" style={{ color: '#34d399' }}>
                💪 STRENGTHS ({financialAnalysis.strengths.length})
              </h3>
              <div className="space-y-2">
                {financialAnalysis.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span style={{ color: '#10b981', fontSize: '10px', marginTop: 4 }}>●</span>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {s.point || s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {financialAnalysis.weaknesses?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold mb-3" style={{ color: '#fb7185' }}>
                ⚠️ WEAKNESSES ({financialAnalysis.weaknesses.length})
              </h3>
              <div className="space-y-2">
                {financialAnalysis.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span style={{ color: '#f43f5e', fontSize: '10px', marginTop: 4 }}>●</span>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {w.point || w}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Verified Facts ─────────────────────────────────────────────── */}
      {verifiedFacts.length > 0 && (
        <div className="glass-card p-5 fade-in fade-in-delay-3">
          <h2 className="text-sm font-bold mb-4" style={{ color: '#34d399' }}>
            ✓ VERIFIED FACTS ({verifiedFacts.length})
          </h2>
          <div className="space-y-2">
            {verifiedFacts.map((fact, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {fact.fact || fact}
                  </p>
                  {fact.sourceUrls?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {fact.sourceUrls.slice(0, 2).map((url, j) => {
                        let hostname = url;
                        try { hostname = new URL(url).hostname.replace('www.', ''); } catch {}
                        return (
                          <a key={j} href={url} target="_blank" rel="noopener noreferrer"
                            className="source-chip high" style={{ fontSize: '10px' }}>
                            <ExternalLink size={8} />
                            <span className="truncate" style={{ maxWidth: '100px' }}>{hostname}</span>
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

      {/* ── Unverified Claims ─────────────────────────────────────────── */}
      {unverifiedClaims.length > 0 && (
        <div className="glass-card p-5 fade-in fade-in-delay-4">
          <h2 className="text-sm font-bold mb-4" style={{ color: '#fbbf24' }}>
            ⚠️ UNVERIFIED CLAIMS ({unverifiedClaims.length})
          </h2>
          <div className="space-y-2">
            {unverifiedClaims.map((claim, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>?</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{claim}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Missing Information ───────────────────────────────────────── */}
      {missingInformation.length > 0 && (
        <div className="glass-card p-5 fade-in">
          <h2 className="text-sm font-bold mb-4" style={{ color: '#fb7185' }}>
            ❌ INFORMATION WE COULD NOT VERIFY ({missingInformation.length})
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            The following data points could not be verified from available sources.
            Missing information has reduced the confidence score.
          </p>
          <div className="space-y-2">
            {missingInformation.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg"
                style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                <span style={{ color: '#f43f5e', flexShrink: 0 }}>✕</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
