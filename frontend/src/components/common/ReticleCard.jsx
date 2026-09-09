import React from 'react';

export function ReticleCard({
  children,
  className = '',
  reticleColor = 'border-primary-container',
  glow = false,
  glowColor = 'hover:shadow-[0_0_30px_rgba(0,242,254,0.2)]',
}) {
  return (
    <div
      className={`relative rounded-xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg transition-all duration-300 ${
        glow ? glowColor : ''
      } ${className}`}
    >
      {/* 4 Corner Reticles */}
      <div className={`absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 ${reticleColor} pointer-events-none`}></div>
      <div className={`absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 ${reticleColor} pointer-events-none`}></div>
      <div className={`absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 ${reticleColor} pointer-events-none`}></div>
      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 ${reticleColor} pointer-events-none`}></div>

      {children}
    </div>
  );
}
