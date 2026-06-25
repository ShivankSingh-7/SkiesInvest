import { useEffect, useRef, useState } from 'react';

export default function ConfidenceBar({ value = 0, label = '', color = null, showValue = true }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef(null);

  const getColor = () => {
    if (color) return color;
    if (value >= 75) return '#10b981';
    if (value >= 50) return '#f59e0b';
    return '#f43f5e';
  };
  const barColor = getColor();

  useEffect(() => {
    let start = null;
    const duration = 1200;
    const to = value;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(Math.round(to * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const textColor =
    value >= 75 ? '#34d399' : value >= 50 ? '#fbbf24' : '#fb7185';

  return (
    <div style={{ width: '100%' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {label && (
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: textColor }}>
              {displayed}%
            </span>
          )}
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${displayed}%`,
            background: `linear-gradient(90deg, ${barColor}90, ${barColor})`,
            boxShadow: `0 0 10px ${barColor}50`,
          }}
        />
      </div>
    </div>
  );
}
