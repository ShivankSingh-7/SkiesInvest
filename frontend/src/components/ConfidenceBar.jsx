import { useEffect, useRef, useState } from 'react';

export default function ConfidenceBar({ value = 0, informationGap = 0, label = '', color = null, showValue = true }) {
  const [displayedConf, setDisplayedConf] = useState(0);
  const [displayedGap, setDisplayedGap] = useState(0);
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
    const toConf = value;
    const toGap = informationGap;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayedConf(Math.round(toConf * eased));
      setDisplayedGap(Math.round(toGap * eased));
      
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, informationGap]);

  const textColor =
    value >= 75 ? '#34d399' : value >= 50 ? '#fbbf24' : '#fb7185';

  return (
    <div style={{ width: '100%' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <div>
            {label && (
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {label}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, background: barColor, borderRadius: 2 }}></div>
                Verified
              </span>
              {informationGap > 0 && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px)`
                  }}></div>
                  Info Gap
                </span>
              )}
            </div>
          </div>
          {showValue && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: textColor, lineHeight: 1 }}>
                {displayedConf}%
              </span>
            </div>
          )}
        </div>
      )}
      <div className="progress-bar" style={{ display: 'flex' }}>
        {/* Confirmed Segment */}
        <div
          className="progress-fill"
          style={{
            width: `${displayedConf}%`,
            background: `linear-gradient(90deg, ${barColor}90, ${barColor})`,
            boxShadow: `0 0 10px ${barColor}50`,
          }}
        />
        {/* Information Gap Segment */}
        {informationGap > 0 && (
          <div
            style={{
              width: `${displayedGap}%`,
              height: '100%',
              background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)`,
              borderLeft: '1px solid rgba(0,0,0,0.3)',
              transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />
        )}
      </div>
    </div>
  );
}
