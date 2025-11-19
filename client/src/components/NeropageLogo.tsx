
import React from 'react';

interface NeropageLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function NeropageLogo({ size = 32, className = '', animate = true }: NeropageLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        animation: animate ? 'float 4s ease-in-out infinite' : 'none'
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-lg opacity-60 blur-sm"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)',
        }}
      />
      
      {/* Main logo container */}
      <div
        className="relative flex items-center justify-center font-black rounded-lg border-2"
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1))',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(139, 92, 246, 0.4)',
        }}
      >
        {/* NP Text */}
        <span
          className="select-none"
          style={{
            fontSize: size * 0.5,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4, #EC4899, #8B5CF6)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
            animation: 'shimmer 3s linear infinite',
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
        className="absolute top-0 right-0 rounded-full"
        style={{ 
          width: size * 0.08, 
          height: size * 0.08,
          background: '#06B6D4',
          boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 rounded-full"
        style={{ 
          width: size * 0.08, 
          height: size * 0.08,
          background: '#8B5CF6',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)',
        }}
      />
    </div>
  );
}
