import React from 'react';

interface WatermarkProps {
  enabled: boolean;
  opacity?: number;
}

export const Watermark: React.FC<WatermarkProps> = ({ enabled, opacity = 0.05 }) => {
  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center select-none overflow-hidden"
    >
      <div
        className="animate-watermark text-center font-extrabold tracking-tighter text-slate-100"
        style={{
          opacity,
          fontSize: 'clamp(3.5rem, 12vw, 10rem)',
          letterSpacing: '-0.03em',
          textShadow: '0 0 80px rgba(6, 182, 212, 0.2)',
          userSelect: 'none',
        }}
      >
        basoka ai
      </div>
    </div>
  );
};
