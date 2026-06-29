import { Activity, ShieldAlert, ArrowUpRight, ArrowRight, ArrowDownRight, Info, Link as LinkIcon, Database } from 'lucide-react';
import ConfidenceBar from './ConfidenceBar';

const DECISION_CONFIG = {
  INVEST: {
    icon: <ArrowUpRight size={24} />,
    label: 'INVEST',
    sublabel: 'Strong opportunity',
    color: 'var(--success)',
    badgeClass: 'badge-invest',
  },
  WATCH: {
    icon: <ArrowRight size={24} />,
    label: 'WATCH',
    sublabel: 'Monitor closely',
    color: 'var(--accent-primary)',
    badgeClass: 'badge-invest', // Will override with inline styles later if needed
  },
  PASS: {
    icon: <ArrowDownRight size={24} />,
    label: 'PASS',
    sublabel: 'Not recommended',
    color: 'var(--danger)',
    badgeClass: 'badge-pass',
  },
  INCONCLUSIVE: {
    icon: <Info size={24} />,
    label: 'INCONCLUSIVE',
    sublabel: 'Insufficient data',
    color: 'var(--warning)',
    badgeClass: 'badge-need-data',
  },
  NEED_MORE_DATA: {
    icon: <Info size={24} />,
    label: 'INCONCLUSIVE',
    sublabel: 'Insufficient data',
    color: 'var(--warning)',
    badgeClass: 'badge-need-data',
  },
};

function ReasoningItem({ reason, index }) {
  const isPos = reason.type === 'positive';
  const isNeg = reason.type === 'negative';
  const color = isPos ? 'var(--success)' : isNeg ? 'var(--danger)' : 'var(--text-secondary)';
  const icon = isPos ? <ArrowUpRight size={18} /> : isNeg ? <ArrowDownRight size={18} /> : <ArrowRight size={18} />;

  return (
    <div
      className="fade-in"
      style={{
        display: 'flex', gap: 16, padding: '16px 20px', borderRadius: 8,
        background: 'transparent', border: '1px solid var(--border)',
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div style={{ color, marginTop: 2, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
          {reason.point}
        </p>
        {reason.sourceUrls && reason.sourceUrls.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {reason.sourceUrls.slice(0, 3).map((url, i) => {
              let host = url;
              try { host = new URL(url).hostname.replace('www.', ''); } catch {}
              return (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)',
                    textDecoration: 'none', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = '#52525b'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <LinkIcon size={10} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, whiteSpace: 'nowrap' }}>{host}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysisCard({ result }) {
  if (!result) return null;

  const {
    companyName, companyStatus, decision, confidence, investmentScore,
    reasoning = [], verifiedFacts = [], unverifiedClaims = [],
    missingInformation = [], informationGaps = [],
    summary, committeeSummary,
    memoryUsed, analysisCount,
    financialAnalysis = {},
  } = result;

  const displaySummary = summary || committeeSummary || '';
  const displayGaps = informationGaps.length > 0 ? informationGaps : missingInformation;
  const config = DECISION_CONFIG[decision] || DECISION_CONFIG.INCONCLUSIVE;

  // Watch decision color override for badge
  const watchStyle = decision === 'WATCH' ? { background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)' } : {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header Card ──────────────────────────────────────────── */}
      <div className="flat-card fade-in" style={{ padding: '32px 40px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
              Investment Recommendation
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                {companyName}
              </h1>
              {companyStatus && (String(companyStatus).toLowerCase().includes('private') || String(companyStatus).toLowerCase().includes('unlisted') || String(companyStatus).toLowerCase().includes('not listed')) && (
                <span style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)',
                  border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  Not Listed
                </span>
              )}
            </div>
            
            {memoryUsed && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Database size={12} /> Memory active · Analysis #{analysisCount}
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div className={config.badgeClass} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 8,
              fontSize: 20, fontWeight: 700, letterSpacing: '0.02em',
              ...watchStyle
            }}>
              {config.icon}
              {config.label}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, fontWeight: 500 }}>
              {config.sublabel}
            </p>
          </div>
        </div>

        {displaySummary && (
          <div style={{
            padding: '20px 24px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.02)',
            borderLeft: `3px solid ${config.color}`, borderTop: '1px solid var(--border)',
            borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)'
          }}>
            <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
              {displaySummary}
            </p>
          </div>
        )}
      </div>

      {/* ── Metrics Grid ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Score Card */}
        <div className="flat-card fade-in-delay-1" style={{ padding: '32px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 24, textTransform: 'uppercase' }}>
            Investment Score
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {investmentScore || 0}
            </span>
            <span style={{ fontSize: 16, color: 'var(--text-muted)', paddingBottom: 6 }}>/100</span>
          </div>
          <div className="progress-bar-flat" style={{ marginBottom: 16 }}>
            <div className="progress-fill-flat" style={{ width: `${investmentScore || 0}%`, background: config.color }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Quantitative measure based on financial health and market position.
          </p>
        </div>

        {/* Confidence Card */}
        <div className="flat-card fade-in-delay-1" style={{ padding: '32px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 24, textTransform: 'uppercase' }}>
            Evidence Confidence
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {Math.round(confidence || 0)}
            </span>
            <span style={{ fontSize: 16, color: 'var(--text-muted)', paddingBottom: 6 }}>%</span>
          </div>
          <ConfidenceBar 
            score={confidence} 
            totalFindings={verifiedFacts.length + unverifiedClaims.length}
            verifiedCount={verifiedFacts.length}
          />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, marginTop: 16 }}>
            Based on {verifiedFacts.length} verified data points from authoritative sources.
          </p>
        </div>

      </div>

      {/* ── Financial Overview ───────────────────────────────────────── */}
      <div className="flat-card fade-in-delay-2" style={{ padding: '32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Activity size={20} color="var(--text-muted)" />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Financial Overview
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Revenue Growth</p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
              {financialAnalysis?.metrics?.revenueGrowth || 'Data Unavailable'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Profitability</p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
              {financialAnalysis?.metrics?.profitability || 'Data Unavailable'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Funding Status</p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
              {financialAnalysis?.metrics?.fundingStatus || 'Data Unavailable'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Committee Reasoning ─────────────────────────────────────── */}
      <div className="flat-card fade-in-delay-2" style={{ padding: '32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <ShieldAlert size={20} color="var(--text-muted)" />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Committee Reasoning
          </h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reasoning.map((r, i) => (
            <ReasoningItem key={i} reason={r} index={i} />
          ))}
          {reasoning.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: 16, textAlign: 'center' }}>
              No detailed reasoning provided.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
