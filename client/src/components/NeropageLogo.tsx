
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
      {/* Outer hexagonal frame */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))',
        }}
      >
        <defs>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="npGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }}>
              <animate attributeName="stop-color" values="#8B5CF6;#06B6D4;#EC4899;#8B5CF6" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }}>
              <animate attributeName="stop-color" values="#06B6D4;#EC4899;#8B5CF6;#06B6D4" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        
        {/* Hexagonal outline */}
        <polygon
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          fill="none"
          stroke="url(#hexGradient)"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Inner geometric pattern */}
        <polygon
          points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
          fill="rgba(139, 92, 246, 0.1)"
          stroke="url(#hexGradient)"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
      
      {/* Central logo container */}
      <div
        className="relative flex items-center justify-center font-black"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: '20%',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        {/* NP Text with professional styling */}
        <svg width={size * 0.6} height={size * 0.5} viewBox="0 0 60 50">
          <text
            x="30"
            y="35"
            textAnchor="middle"
            fill="url(#npGradient)"
            fontSize="32"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-2"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4))',
            }}
          >
            NP
          </text>
        </svg>
        
        {/* Geometric accent lines */}
        <div
          className="absolute top-1 right-1 w-2 h-2 opacity-70"
          style={{
            background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
          }}
        />
        <div
          className="absolute bottom-1 left-1 w-2 h-2 opacity-70"
          style={{
            background: 'linear-gradient(135deg, #EC4899, #06B6D4)',
            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
          }}
        />
      </div>
      
      {/* Orbital particles */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.06,
          height: size * 0.06,
          background: '#06B6D4',
          boxShadow: '0 0 6px rgba(6, 182, 212, 0.8)',
          top: '10%',
          right: '15%',
          animation: animate ? 'orbit-1 4s linear infinite' : 'none',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.05,
          height: size * 0.05,
          background: '#EC4899',
          boxShadow: '0 0 6px rgba(236, 72, 153, 0.8)',
          bottom: '15%',
          left: '10%',
          animation: animate ? 'orbit-2 5s linear infinite' : 'none',
        }}
      />
    </div>
  );
}
