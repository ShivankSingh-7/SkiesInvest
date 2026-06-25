import { useEffect, useRef } from 'react';

const STAGES = [
  { id: 'memory',    label: 'Memory',    icon: '🧠', desc: 'Checking previous analyses' },
  { id: 'research',  label: 'Research',  icon: '🔍', desc: 'Searching the web' },
  { id: 'evidence',  label: 'Evidence',  icon: '📊', desc: 'Validating sources' },
  { id: 'financial', label: 'Financial', icon: '💰', desc: 'Analyzing financials' },
  { id: 'risk',      label: 'Risk',      icon: '⚠️', desc: 'Assessing risks' },
  { id: 'decision',  label: 'Decision',  icon: '⚖️', desc: 'Committee review' },
  { id: 'saving',    label: 'Saving',    icon: '💾', desc: 'Storing results' },
];

const STAGE_ORDER = STAGES.map((s) => s.id);

export default function LoadingScreen({ companyName, progressLog }) {
  const logRef = useRef(null);

  const currentStageId = progressLog.length > 0
    ? progressLog[progressLog.length - 1].stage
    : null;

  const currentStageIndex = STAGE_ORDER.indexOf(currentStageId);

  const getStageStatus = (stageId) => {
    const idx = STAGE_ORDER.indexOf(stageId);
    if (idx < currentStageIndex) return 'completed';
    if (idx === currentStageIndex) return 'active';
    return 'pending';
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [progressLog]);

  return (
    <div className="min-h-screen bg-animated dot-grid flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 fade-in">
          <div className="inline-flex items-center gap-3 glass-card px-5 py-2.5 mb-6">
            <div className="pulse-dot" style={{ background: '#3b82f6' }} />
            <span className="text-sm font-medium" style={{ color: '#60a5fa' }}>
              Analysis in Progress
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Analyzing </span>
            <span style={{ color: 'var(--text-primary)' }}>{companyName}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Our AI agents are researching and analyzing this company in real-time
          </p>
        </div>

        {/* Stage Pipeline */}
        <div className="glass-card p-6 mb-6 fade-in fade-in-delay-1">
          <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-secondary)' }}>
            AGENT PIPELINE
          </h2>
          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const status = getStageStatus(stage.id);
              return (
                <div
                  key={stage.id}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all duration-300"
                  style={{
                    background: status === 'active'
                      ? 'rgba(59, 130, 246, 0.08)'
                      : 'transparent',
                  }}
                >
                  {/* Status node */}
                  <div className={`stage-node ${status}`}>
                    {status === 'completed' ? '✓' : (idx + 1)}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stage.icon}</span>
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: status === 'pending'
                            ? 'var(--text-muted)'
                            : 'var(--text-primary)',
                        }}
                      >
                        {stage.label}
                      </span>
                      {status === 'active' && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                          }}
                        >
                          Running
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {stage.desc}
                    </p>
                  </div>

                  {/* Connector line */}
                  {status === 'completed' && (
                    <span style={{ color: '#10b981', fontSize: '12px' }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Log */}
        <div className="glass-card p-5 fade-in fade-in-delay-2">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}>
            <span className="pulse-dot" style={{ background: '#10b981' }} />
            LIVE LOG
          </h2>
          <div
            ref={logRef}
            className="space-y-1.5 font-mono overflow-y-auto"
            style={{ maxHeight: '180px', fontSize: '12px' }}
          >
            {progressLog.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Initializing agents...</p>
            ) : (
              progressLog.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2"
                  style={{ color: i === progressLog.length - 1 ? '#60a5fa' : 'var(--text-muted)' }}
                >
                  <span style={{ opacity: 0.5, minWidth: '55px' }}>
                    {new Date(entry.timestamp || Date.now()).toLocaleTimeString('en', {
                      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </span>
                  <span>[{entry.stage?.toUpperCase() || 'INIT'}]</span>
                  <span className="truncate">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          This may take 30-90 seconds. We're running multiple AI agents in sequence.
        </p>
      </div>
    </div>
  );
}
