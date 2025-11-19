import React from 'react';

interface NeropageLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function NeropageLogo({ size = 32, className = '', animate = true }: NeropageLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className} ${animate ? 'animate-pulse-neon' : ''}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full neon-glow"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
        }}
      />
      <div
        className="relative flex items-center justify-center font-bold text-white"
        style={{
          fontSize: size * 0.6,
          textShadow: '0 0 10px rgba(255,255,255,0.8)'
        }}
      >
        N
      </div>
    </div>
  );
}