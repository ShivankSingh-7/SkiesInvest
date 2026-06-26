import { CheckCircle2, AlertTriangle, Link as LinkIcon, FileSearch } from 'lucide-react';

function SourceChip({ source }) {
  const displayName = source.displayName || source.title || 'Source';
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)',
        textDecoration: 'none', transition: 'all 0.2s',
        maxWidth: '100%'
      }}
      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = '#52525b'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
      title={`${source.title || source.url} (Quality: ${source.qualityScore || '?'}/100)`}
    >
      <LinkIcon size={12} style={{ flexShrink: 0 }} />
      <span style={{
        overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', flex: 1
      }}>
        {displayName}
      </span>
    </a>
  );
}

function EvidenceItem({ finding, index }) {
  const conf = finding.confidence || 0;
  const confColor = conf >= 70 ? 'var(--success)' : conf >= 50 ? 'var(--warning)' : 'var(--danger)';
  
  return (
    <div
      className="flat-card fade-in"
      style={{ padding: '24px', animationDelay: `${index * 0.04}s`, background: 'rgba(255, 255, 255, 0.01)' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}>
          {finding.category || 'Observation'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: confColor }}>
          {conf >= 70 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>
            {conf}% confidence
          </span>
        </div>
      </div>

      {/* Statement */}
      <p style={{
        fontSize: 14, lineHeight: 1.6, marginBottom: 20, margin: '0 0 20px 0',
        color: finding.isVerified ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}>
        {!finding.isVerified && (
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4, marginRight: 8,
            background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)',
            border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 500
          }}>Unverified</span>
        )}
        {finding.statement}
      </p>

      {/* Sources */}
      {finding.sources && finding.sources.length > 0 ? (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Sources ({finding.sourceCount || finding.sources.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {finding.sources.map((src, i) => <SourceChip key={i} source={src} />)}
          </div>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <AlertTriangle size={14} /> No verifiable sources
          </p>
        </div>
      )}
    </div>
  );
}

export default function EvidenceList({ findings = [], showUnverified = false }) {
  const verified = findings.filter((f) => f.isVerified || f.confidence >= 60);
  const unverified = findings.filter((f) => !f.isVerified && f.confidence < 60);

  if (findings.length === 0) {
    return (
      <div className="flat-card" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <FileSearch size={32} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No evidence findings available</p>
      </div>
    );
  }

  return (
    <div>
      {verified.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', letterSpacing: '0.05em' }}>
              VERIFIED FINDINGS ({verified.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {verified.map((f, i) => <EvidenceItem key={i} finding={f} index={i} />)}
          </div>
        </div>
      )}

      {unverified.length > 0 && showUnverified && (
        <div>
          <hr className="divider-clean" />
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)', letterSpacing: '0.05em' }}>
              LOW CONFIDENCE FINDINGS ({unverified.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {unverified.map((f, i) => <EvidenceItem key={i} finding={f} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
