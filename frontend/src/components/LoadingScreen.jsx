import { useEffect, useRef } from 'react';
import { Database, Search, Cpu, ListChecks, DollarSign, ShieldAlert, Scale, Save } from 'lucide-react';

const STAGES = [
  { id: 'memory',    label: 'Memory Retrieval',    icon: <Database size={16} />, desc: 'Checking previous analyses' },
  { id: 'research',  label: 'Research Collector',   icon: <Search size={16} />, desc: 'Searching web sources' },
  { id: 'consolidator', label: 'Knowledge Consolidator', icon: <Cpu size={16} />, desc: 'Merging facts & building JSON' },
  { id: 'evidence',  label: 'Evidence Validation',  icon: <ListChecks size={16} />, desc: 'Validating & scoring sources' },
  { id: 'financial', label: 'Financial Analysis',   icon: <DollarSign size={16} />, desc: 'Analyzing financials' },
  { id: 'risk',      label: 'Risk Assessment',      icon: <ShieldAlert size={16} />, desc: 'Assessing investment risks' },
  { id: 'decision',  label: 'Investment Committee', icon: <Scale size={16} />, desc: 'Making final decision' },
  { id: 'saving',    label: 'Memory Save',          icon: <Save size={16} />, desc: 'Storing results' },
];

const STAGE_ORDER = STAGES.map((s) => s.id);

export default function LoadingScreen({ companyName, progressLog }) {
  const logRef = useRef(null);
  const currentStageId = progressLog.length > 0 ? progressLog[progressLog.length - 1].stage : null;
  const currentStageIndex = STAGE_ORDER.indexOf(currentStageId);

  const getStageStatus = (stageId) => {
    const idx = STAGE_ORDER.indexOf(stageId);
    if (idx < currentStageIndex) return 'completed';
    if (idx === currentStageIndex) return 'active';
    return 'pending';
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [progressLog]);

  return (
    <div className="bg-subtle-grid" style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>

        {/* Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999, marginBottom: 24,
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
            Analysis in Progress
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Analyzing {companyName}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Our AI agents are researching and analyzing this company in real-time.
          </p>
        </div>

        {/* Stage Pipeline */}
        <div className="flat-card fade-in-delay-1" style={{ padding: '24px', marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase' }}>
            Agent Pipeline
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STAGES.map((stage, idx) => {
              const status = getStageStatus(stage.id);
              return (
                <div key={stage.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '12px 16px', borderRadius: 8,
                  background: status === 'active' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  border: status === 'active' ? '1px solid var(--border)' : '1px solid transparent',
                  transition: 'background 0.2s',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                    background: status === 'completed' ? 'var(--text-primary)' : status === 'active' ? 'var(--bg-card)' : 'transparent',
                    border: status === 'pending' ? '1px solid var(--border)' : '1px solid transparent',
                    color: status === 'completed' ? 'var(--bg-primary)' : status === 'active' ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                    {status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <div style={{ flex: 1, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{stage.icon}</span>
                      <span style={{
                        fontSize: 14, fontWeight: 500,
                        color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}>
                        {stage.label}
                      </span>
                      {status === 'active' && (
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 999,
                          background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)',
                          fontWeight: 500, border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>Running</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Log */}
        <div className="flat-card fade-in-delay-2" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Live System Log
            </span>
          </div>
          <div ref={logRef} style={{
            maxHeight: 140, overflowY: 'auto', display: 'flex',
            flexDirection: 'column', gap: 8,
          }}>
            {progressLog.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                Initializing system...
              </p>
            ) : (
              progressLog.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, fontSize: 12, fontFamily: 'monospace',
                  color: i === progressLog.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  <span style={{ opacity: i === progressLog.length - 1 ? 0.7 : 0.4, flexShrink: 0 }}>
                    {new Date(entry.timestamp || Date.now()).toLocaleTimeString('en', {
                      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </span>
                  <span style={{ flexShrink: 0, fontWeight: 500 }}>[{(entry.stage || 'INIT').toUpperCase()}]</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
