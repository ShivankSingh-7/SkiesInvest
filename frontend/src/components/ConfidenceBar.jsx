import { useEffect, useRef, useState } from 'react';

export default function ConfidenceBar({ score = 0, totalFindings = 0, verifiedCount = 0 }) {
  const [displayedConf, setDisplayedConf] = useState(0);
  const rafRef = useRef(null);

  const getColor = () => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };
  const barColor = getColor();

  useEffect(() => {
    let start = null;
    const duration = 800;
    const target = score;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayedConf(Math.round(target * eased));
      
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  return (
    <div style={{ width: '100%' }}>
      <div className="progress-bar-flat" style={{ marginBottom: 12 }}>
        <div
          className="progress-fill-flat"
          style={{
            width: `${displayedConf}%`,
            background: barColor,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Low Confidence</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>High Confidence</span>
      </div>
    </div>
  );
}
