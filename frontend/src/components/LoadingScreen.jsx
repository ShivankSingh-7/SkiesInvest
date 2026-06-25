import { useEffect, useRef, useState } from 'react';

const STAGES = [
  { id: 'memory',    label: 'Memory Retrieval',    icon: '🧠', desc: 'Checking previous analyses' },
  { id: 'research',  label: 'Research Agent',       icon: '🔍', desc: 'Searching web sources' },
  { id: 'evidence',  label: 'Evidence Validation',  icon: '📊', desc: 'Validating & scoring sources' },
  { id: 'financial', label: 'Financial Analysis',   icon: '💰', desc: 'Analyzing financials' },
  { id: 'risk',      label: 'Risk Assessment',      icon: '⚠️', desc: 'Assessing investment risks' },
  { id: 'decision',  label: 'Investment Committee', icon: '⚖️', desc: 'Making final decision' },
  { id: 'saving',    label: 'Memory Save',          icon: '💾', desc: 'Storing results' },
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
    <div className="bg-animated dot-grid" style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 640 }}>

        {/* Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999, marginBottom: 20,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
            color: '#60a5fa', fontSize: 12, fontWeight: 600,
          }}>
            <div className="pulse-dot" style={{ background: '#3b82f6' }} />
            Analysis in Progress
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
            <span className="gradient-text">Analyzing </span>
            {companyName}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Our AI agents are researching and analyzing this company in real-time
          </p>
        </div>

        {/* Stage Pipeline */}
        <div className="glass-card fade-in fade-in-delay-1" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 18, textTransform: 'uppercase' }}>
            Agent Pipeline
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STAGES.map((stage, idx) => {
              const status = getStageStatus(stage.id);
              return (
                <div key={stage.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 14px', borderRadius: 12,
                  background: status === 'active' ? 'rgba(59,130,246,0.08)' : 'transparent',
                  transition: 'background 0.3s',
                }}>
                  <div className={`stage-node ${status}`}>
                    {status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13 }}>{stage.icon}</span>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}>
                        {stage.label}
                      </span>
                      {status === 'active' && (
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 999,
                          background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                          fontWeight: 600,
                        }}>Running</span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {stage.desc}
                    </p>
                  </div>
                  {status === 'completed' && (
                    <span style={{ color: '#10b981', fontSize: 14 }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Log */}
        <div className="glass-card fade-in fade-in-delay-2" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div className="pulse-dot" style={{ background: '#10b981' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Live Log
            </span>
          </div>
          <div ref={logRef} style={{
            maxHeight: 160, overflowY: 'auto', display: 'flex',
            flexDirection: 'column', gap: 4,
          }}>
            {progressLog.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                Initializing agents...
              </p>
            ) : (
              progressLog.map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, fontSize: 11, fontFamily: 'monospace',
                  color: i === progressLog.length - 1 ? '#60a5fa' : 'var(--text-muted)',
                }}>
                  <span style={{ opacity: 0.5, flexShrink: 0 }}>
                    {new Date(entry.timestamp || Date.now()).toLocaleTimeString('en', {
                      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </span>
                  <span style={{ flexShrink: 0 }}>[{(entry.stage || 'INIT').toUpperCase()}]</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
          This may take 30–90 seconds. We're running multiple AI agents in sequence.
        </p>
      </div>
    </div>
  );
}
