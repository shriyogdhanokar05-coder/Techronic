import React from 'react';

export function CyberLogo({ className = 'h-8 w-auto' }) {
  return (
    <div className="flex items-center gap-space-sm select-none">
      <img
        src="/logo.svg"
        alt="TECHRONICS Cyber Logo"
        className={`${className} object-contain`}
        onError={(e) => {
          // Fallback inline SVG if external image fails
          e.target.style.display = 'none';
        }}
      />
      <div className="flex flex-col">
        <span className="font-headline-sm text-headline-sm uppercase text-primary tracking-wider font-bold">
          TECHRONICS
        </span>
        <span className="font-label-data-sm text-[10px] uppercase text-secondary bg-secondary-container/40 px-space-2xs py-0.5 rounded tracking-widest">
          ESPORTS BATTLE ARENA
        </span>
      </div>
    </div>
  );
}
