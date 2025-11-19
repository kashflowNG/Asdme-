
import React from 'react';

interface NeropageLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function NeropageLogo({ size = 32, className = '', animate = true }: NeropageLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className} ${animate ? 'animate-float' : ''}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow circle */}
      <div
        className="absolute inset-0 rounded-lg neon-glow opacity-60 blur-sm"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
        }}
      />
      
      {/* Main logo container */}
      <div
        className="relative flex items-center justify-center font-black rounded-lg border-2 border-primary/40"
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1))',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* NP Text */}
        <span
          className="gradient-shimmer bg-clip-text text-transparent select-none"
          style={{
            fontSize: size * 0.5,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            textShadow: '0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(6, 182, 212, 0.3)',
          }}
        >
          NP
        </span>
        
        {/* Inner highlight */}
        <div
          className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent 60%)',
          }}
        />
      </div>
      
      {/* Corner accents */}
      <div
        className="absolute top-0 right-0 w-1 h-1 bg-cyan-400 rounded-full neon-glow-strong"
        style={{ width: size * 0.08, height: size * 0.08 }}
      />
      <div
        className="absolute bottom-0 left-0 w-1 h-1 bg-purple-400 rounded-full neon-glow"
        style={{ width: size * 0.08, height: size * 0.08 }}
      />
    </div>
  );
}
