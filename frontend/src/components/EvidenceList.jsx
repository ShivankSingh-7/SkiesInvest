import { ExternalLink } from 'lucide-react';

function getChipClass(qualityScore) {
  if (qualityScore >= 75) return 'high';
  if (qualityScore >= 50) return 'medium';
  return 'low';
}

function SourceChip({ source }) {
  const chipClass = getChipClass(source.qualityScore || 50);
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`source-chip ${chipClass}`}
      title={source.title || source.url}
    >
      <ExternalLink size={9} />
      <span>{source.displayName || source.title || 'Source'}</span>
      {source.qualityScore && (
        <span style={{ opacity: 0.6, fontSize: '9px' }}>({source.qualityScore})</span>
      )}
    </a>
  );
}

function EvidenceItem({ finding, index }) {
  const confidenceClass =
    finding.confidence >= 70 ? 'confidence-high' :
    finding.confidence >= 50 ? 'confidence-medium' : 'confidence-low';

  return (
    <div
      className="glass-card p-4 fade-in"
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
    >
      {/* Category + Confidence */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            background: 'rgba(139,92,246,0.1)',
            color: '#a78bfa',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          {finding.category || 'Finding'}
        </span>
        <span className={`text-xs font-mono font-bold ${confidenceClass}`}>
          {finding.confidence}% confidence
        </span>
      </div>

      {/* Statement */}
      <p
        className="text-sm leading-relaxed mb-3"
        style={{ color: finding.isVerified ? 'var(--text-primary)' : 'var(--text-secondary)' }}
      >
        {!finding.isVerified && (
          <span
            className="text-xs mr-2 px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}
          >
            Unverified
          </span>
        )}
        {finding.statement}
      </p>

      {/* Sources */}
      {finding.sources && finding.sources.length > 0 && (
        <div>
          <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Sources ({finding.sourceCount || finding.sources.length}):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {finding.sources.map((src, i) => (
              <SourceChip key={i} source={src} />
            ))}
          </div>
        </div>
      )}

      {(!finding.sources || finding.sources.length === 0) && (
        <p className="text-xs" style={{ color: '#f43f5e' }}>
          ⚠ No sources available for this finding
        </p>
      )}
    </div>
  );
}

export default function EvidenceList({ findings = [], showUnverified = false }) {
  const verified = findings.filter((f) => f.isVerified || f.confidence >= 60);
  const unverified = findings.filter((f) => !f.isVerified && f.confidence < 60);

  const displayed = showUnverified ? findings : verified;

  if (findings.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p style={{ color: 'var(--text-secondary)' }}>No evidence findings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Verified findings */}
      {verified.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold" style={{ color: '#34d399' }}>
              ✓ VERIFIED FINDINGS ({verified.length})
            </span>
          </div>
          <div className="space-y-3">
            {verified.map((f, i) => (
              <EvidenceItem key={i} finding={f} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {verified.length > 0 && unverified.length > 0 && (
        <div className="divider" />
      )}

      {/* Unverified findings */}
      {unverified.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>
              ⚠ LOW CONFIDENCE FINDINGS ({unverified.length})
            </span>
          </div>
          <div className="space-y-3">
            {unverified.map((f, i) => (
              <EvidenceItem key={i} finding={f} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
