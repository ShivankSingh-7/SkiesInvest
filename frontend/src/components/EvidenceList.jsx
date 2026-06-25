function getChipClass(qualityScore) {
  if (qualityScore >= 75) return 'high';
  if (qualityScore >= 50) return 'medium';
  return 'low';
}

function SourceChip({ source }) {
  const chipClass = getChipClass(source.qualityScore || 50);
  const displayName = source.displayName || source.title || 'Source';
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`source-chip ${chipClass}`}
      title={`${source.title || source.url} (Quality: ${source.qualityScore || '?'}/100)`}
    >
      <span style={{ fontSize: 9 }}>↗</span>
      <span style={{
        overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', maxWidth: 120,
      }}>
        {displayName}
      </span>
    </a>
  );
}

function EvidenceItem({ finding, index }) {
  const conf = finding.confidence || 0;
  const confColor = conf >= 70 ? '#34d399' : conf >= 50 ? '#fbbf24' : '#fb7185';
  const catColors = {
    revenue: '#3b82f6', growth: '#10b981', market: '#8b5cf6',
    competition: '#f59e0b', risk: '#f43f5e', funding: '#06b6d4',
    management: '#ec4899', product: '#6366f1', regulatory: '#ef4444', other: '#64748b',
  };
  const catColor = catColors[finding.category] || '#64748b';

  return (
    <div
      className="glass-card fade-in"
      style={{ padding: '18px 20px', animationDelay: `${index * 0.04}s` }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '3px 10px', borderRadius: 999,
          background: `${catColor}18`, color: catColor,
          border: `1px solid ${catColor}30`,
        }}>
          {finding.category || 'Finding'}
        </span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: confColor, flexShrink: 0 }}>
          {conf}% confidence
        </span>
      </div>

      {/* Statement */}
      <p style={{
        fontSize: 13, lineHeight: 1.65, marginBottom: 12,
        color: finding.isVerified ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}>
        {!finding.isVerified && (
          <span style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 4, marginRight: 8,
            background: 'rgba(245,158,11,0.12)', color: '#fbbf24',
            border: '1px solid rgba(245,158,11,0.25)',
          }}>Unverified</span>
        )}
        {finding.statement}
      </p>

      {/* Sources */}
      {finding.sources && finding.sources.length > 0 ? (
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
            Sources ({finding.sourceCount || finding.sources.length}):
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {finding.sources.map((src, i) => <SourceChip key={i} source={src} />)}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 11, color: '#f43f5e' }}>⚠ No sources available</p>
      )}
    </div>
  );
}

export default function EvidenceList({ findings = [], showUnverified = false }) {
  const verified = findings.filter((f) => f.isVerified || f.confidence >= 60);
  const unverified = findings.filter((f) => !f.isVerified && f.confidence < 60);

  if (findings.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
        <p style={{ color: 'var(--text-secondary)' }}>No evidence findings available</p>
      </div>
    );
  }

  return (
    <div>
      {verified.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>
              ✓ VERIFIED FINDINGS ({verified.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {verified.map((f, i) => <EvidenceItem key={i} finding={f} index={i} />)}
          </div>
        </div>
      )}

      {unverified.length > 0 && showUnverified && (
        <div>
          <div className="divider" />
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>
              ⚠ LOW CONFIDENCE FINDINGS ({unverified.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {unverified.map((f, i) => <EvidenceItem key={i} finding={f} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
