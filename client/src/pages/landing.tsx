
import { Button } from "@/components/ui/button";
import { NeropageLogo } from "@/components/NeropageLogo";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Galaxy Background Animation */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated stars/particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Large gradient orbs */}
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite 5s',
          }}
        />
        <div 
          className="absolute bottom-0 left-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)',
            animation: 'float 30s ease-in-out infinite 10s',
          }}
        />

        {/* Nebula effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
            `,
          }}
        />

        {/* Shooting stars */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 w-16 bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                top: Math.random() * 50 + '%',
                left: '-100px',
                opacity: 0,
                animation: `shootingStar ${Math.random() * 3 + 4}s linear infinite ${Math.random() * 10}s`,
                transform: 'rotate(-45deg)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo with enhanced glow */}
        <div className="mb-8 relative">
          <div 
            className="absolute inset-0 blur-2xl opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6), rgba(6, 182, 212, 0.4), transparent)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
          />
          <NeropageLogo size={120} animate={true} />
        </div>

        {/* Main heading */}
        <h1 
          className="text-6xl md:text-7xl font-black text-center mb-4 select-none"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4, #EC4899, #8B5CF6)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'shimmer 4s linear infinite',
            textShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
          }}
        >
          Neropage
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground text-center mb-12 max-w-2xl">
          The <span className="text-primary font-semibold">neo-neon</span> link platform that unites your digital universe
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-lg neon-glow hover:neon-glow-strong transition-all"
            onClick={() => window.location.href = '/dashboard'}
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = '/dashboard'}
          >
            Sign In
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div 
            className="glass-card p-6 rounded-xl hover-elevate transition-all"
            style={{
              animation: 'fadeIn 0.6s ease-out 0.2s both',
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 neon-glow">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Stunning Design</h3>
            <p className="text-sm text-muted-foreground">
              Neo-neon aesthetics that make your profile stand out in the digital cosmos
            </p>
          </div>

          <div 
            className="glass-card p-6 rounded-xl hover-elevate transition-all"
            style={{
              animation: 'fadeIn 0.6s ease-out 0.4s both',
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4 neon-glow">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Blazing performance with offline-first PWA technology
            </p>
          </div>

          <div 
            className="glass-card p-6 rounded-xl hover-elevate transition-all"
            style={{
              animation: 'fadeIn 0.6s ease-out 0.6s both',
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4 neon-glow-pink">
              <Shield className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your data protected with enterprise-grade security
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-sm text-muted-foreground mt-16 text-center">
          Join thousands of creators in the neon revolution
        </p>
      </div>
    </div>
  );
}
