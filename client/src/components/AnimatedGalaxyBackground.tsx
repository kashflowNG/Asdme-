export function AnimatedGalaxyBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated stars/particles */}
      <div className="absolute inset-0">
        {[...Array(80)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 0.5 + 'px',
              height: Math.random() * 3 + 0.5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: Math.random() * 50 + '%',
              left: Math.random() * 50 + '%',
              animation: `shootingStar ${Math.random() * 3 + 2}s ease-in infinite ${i * 2}s`,
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))',
            }}
          />
        ))}
      </div>

      {/* Primary purple galaxy orb */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
          animation: 'float 25s ease-in-out infinite',
          filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.4))',
        }}
      />

      {/* Secondary cyan galaxy orb */}
      <div
        className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
          animation: 'float 28s ease-in-out infinite 5s',
          filter: 'drop-shadow(0 0 50px rgba(6, 182, 212, 0.3))',
        }}
      />

      {/* Tertiary magenta galaxy orb */}
      <div
        className="absolute bottom-0 left-1/2 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)',
          animation: 'float 32s ease-in-out infinite 10s',
          filter: 'drop-shadow(0 0 45px rgba(236, 72, 153, 0.25))',
        }}
      />

      {/* Top-right blue galaxy orb */}
      <div
        className="absolute top-1/4 right-0 w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
          animation: 'float 30s ease-in-out infinite 8s',
          filter: 'drop-shadow(0 0 35px rgba(59, 130, 246, 0.25))',
        }}
      />

      {/* Bottom-left accent orb */}
      <div
        className="absolute bottom-1/4 left-0 w-64 h-64 rounded-full blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)',
          animation: 'float 26s ease-in-out infinite 3s',
          filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.2))',
        }}
      />
    </div>
  );
}
