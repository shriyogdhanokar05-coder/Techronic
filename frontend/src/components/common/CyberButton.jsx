import React from 'react';
import { playClickSound } from '../../utils/sound';

export function CyberButton({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'surface' | 'danger'
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const handleClick = (e) => {
    playClickSound();
    if (onClick) onClick(e);
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-primary-container via-surface-tint to-primary-fixed-dim text-on-primary font-bold shadow-[0_0_20px_rgba(0,242,254,0.45)] hover:shadow-[0_0_30px_rgba(0,242,254,0.7)] hover:brightness-110 active:scale-[0.99]',
    secondary:
      'bg-gradient-to-r from-secondary-container via-secondary to-secondary-fixed text-on-secondary-fixed font-bold shadow-[0_0_20px_rgba(111,0,190,0.5)] hover:shadow-[0_0_30px_rgba(221,183,255,0.7)] hover:brightness-110 active:scale-[0.99]',
    surface:
      'bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-primary transition',
    danger:
      'bg-error-container text-error hover:bg-error/20 border border-error/30 transition',
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`py-space-sm px-space-md rounded font-headline-sm text-headline-sm uppercase tracking-wider flex items-center justify-center gap-space-xs transition duration-200 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
