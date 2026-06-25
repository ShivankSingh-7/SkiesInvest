import { useEffect, useRef, useState } from 'react';

export default function ConfidenceBar({ value = 0, label = '', color = null, showValue = true, animated = true }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef(null);

  // Determine color based on value if not overridden
  const getColor = () => {
    if (color) return color;
    if (value >= 75) return '#10b981'; // green
    if (value >= 50) return '#f59e0b'; // amber
    return '#f43f5e';                  // red
  };

  const barColor = getColor();

  // Animate the fill
  useEffect(() => {
    if (!animated) {
      setDisplayed(value);
      return;
    }
    let start = null;
    const duration = 1200;
    const from = 0;
    const to = value;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out-quart
      setDisplayed(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, animated]);

  const confidenceClass =
    value >= 75 ? 'confidence-high' : value >= 50 ? 'confidence-medium' : 'confidence-low';

  return (
    <div>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
          {showValue && (
            <span className={`text-sm font-bold font-mono ${confidenceClass}`}>
              {displayed}%
            </span>
          )}
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${(displayed / 100) * 100}%`,
            background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
            boxShadow: `0 0 12px ${barColor}60`,
          }}
        />
      </div>
    </div>
  );
}
