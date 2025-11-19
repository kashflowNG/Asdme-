
import React from 'react';

interface NeropageLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function NeropageLogo({ size = 32, className = '', animate = true }: NeropageLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Neon gradients */}
        <linearGradient id="neonGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        
        <linearGradient id="neonGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Glow filters */}
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Animation for shimmer effect */}
        {animate && (
          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6">
              <animate
                attributeName="stop-color"
                values="#8B5CF6; #06B6D4; #EC4899; #8B5CF6"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#06B6D4">
              <animate
                attributeName="stop-color"
                values="#06B6D4; #EC4899; #8B5CF6; #06B6D4"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#EC4899">
              <animate
                attributeName="stop-color"
                values="#EC4899; #8B5CF6; #06B6D4; #EC4899"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        )}
      </defs>

      {/* Outer glow ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#neonGradient1)"
        strokeWidth="2"
        fill="none"
        filter="url(#neonGlow)"
        opacity="0.6"
      >
        {animate && (
          <animate
            attributeName="r"
            values="45; 46; 45"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* N letter formed by geometric shapes */}
      {/* Left vertical bar */}
      <rect
        x="25"
        y="25"
        width="8"
        height="50"
        fill="url(#shimmerGradient)"
        filter="url(#strongGlow)"
        rx="2"
      />

      {/* Diagonal bar */}
      <rect
        x="31"
        y="35"
        width="8"
        height="42"
        fill="url(#shimmerGradient)"
        filter="url(#strongGlow)"
        rx="2"
        transform="rotate(28 35 56)"
      />

      {/* Right vertical bar */}
      <rect
        x="67"
        y="25"
        width="8"
        height="50"
        fill="url(#shimmerGradient)"
        filter="url(#strongGlow)"
        rx="2"
      />

      {/* Accent dots (cyber detail) */}
      <circle cx="29" cy="23" r="3" fill="#06B6D4" filter="url(#neonGlow)">
        {animate && (
          <animate
            attributeName="opacity"
            values="1; 0.5; 1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      <circle cx="71" cy="23" r="3" fill="#EC4899" filter="url(#neonGlow)">
        {animate && (
          <animate
            attributeName="opacity"
            values="1; 0.5; 1"
            dur="1.5s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <circle cx="50" cy="77" r="3" fill="#8B5CF6" filter="url(#neonGlow)">
        {animate && (
          <animate
            attributeName="opacity"
            values="1; 0.5; 1"
            dur="1.5s"
            begin="1s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Inner energy ring */}
      <circle
        cx="50"
        cy="50"
        r="35"
        stroke="url(#neonGradient2)"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
        strokeDasharray="5 5"
      >
        {animate && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="10s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </svg>
  );
}
