
import { Button } from "@/components/ui/button";
import { NeropageLogo } from "@/components/NeropageLogo";
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp, Users, Globe, Check } from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <>
      <Helmet>
        <script async data-cfasync="false" src="//pl28091865.effectivegatecpm.com/d3086215aaf6d1aac4a8cf2c4eda801b/invoke.js"></script>
        <script type='text/javascript' src='//pl28091887.effectivegatecpm.com/cf/47/df/cf47df159320ecb4f3636e497a6d0d1f.js'></script>
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Galaxy Background Animation */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Animated stars/particles */}
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
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
            {[...Array(5)].map((_, i) => (
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
          <p className="text-xl md:text-2xl text-muted-foreground text-center mb-8 max-w-2xl">
            The <span className="text-primary font-semibold">neo-neon</span> link platform that unites your digital universe
          </p>

          {/* Stats Section */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">500K+</div>
              <div className="text-sm text-muted-foreground">Links Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-lg neon-glow hover:neon-glow-strong transition-all"
              onClick={() => navigate('/signup')}
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/login')}
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
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

          {/* Advanced Features Section */}
          <div className="w-full max-w-6xl mb-16">
            <h2 className="text-4xl font-bold text-center mb-12 gradient-shimmer bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-card p-8 border-primary/20">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground mb-4">
                      Track clicks, visitor demographics, and engagement metrics in real-time
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Real-time visitor tracking
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Click heatmaps
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Geographic insights
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-8 border-cyan-500/20">
                <div className="flex items-start gap-4">
                  <Users className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Smart Customization</h3>
                    <p className="text-muted-foreground mb-4">
                      AI-powered templates and personalization options
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-cyan-400" />
                        Pre-built templates
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-cyan-400" />
                        Custom color schemes
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-cyan-400" />
                        Dynamic content blocks
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-8 border-pink-500/20">
                <div className="flex items-start gap-4">
                  <Globe className="w-8 h-8 text-pink-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Global Reach</h3>
                    <p className="text-muted-foreground mb-4">
                      Share your profile worldwide with QR codes and SEO optimization
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-pink-400" />
                        Custom QR codes
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-pink-400" />
                        SEO optimized
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-pink-400" />
                        Custom domains
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-8 border-primary/20">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Engagement Tools</h3>
                    <p className="text-muted-foreground mb-4">
                      Boost interaction with advanced scheduling and A/B testing
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Link scheduling
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        A/B testing
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Social proof widgets
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="w-full max-w-4xl mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              Trusted by Creators Worldwide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Alex K.", role: "Content Creator", quote: "Neropage transformed my online presence!" },
                { name: "Sarah M.", role: "Influencer", quote: "The analytics are game-changing." },
                { name: "Mike R.", role: "Entrepreneur", quote: "Best link-in-bio platform I've used." }
              ].map((testimonial, i) => (
                <Card 
                  key={i} 
                  className="glass-card p-6"
                  style={{
                    animation: `fadeIn 0.6s ease-out ${0.8 + i * 0.2}s both`,
                  }}
                >
                  <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mb-8">
            <p className="text-lg mb-6 text-muted-foreground">
              Join thousands of creators in the neon revolution
            </p>
            <Button 
              size="lg" 
              className="text-lg px-12 py-6 shadow-lg neon-glow hover:neon-glow-strong transition-all"
              onClick={() => navigate('/signup')}
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Ad Placement */}
          <div className="flex justify-center py-6 mt-8">
            <div className="w-full max-w-sm mx-auto">
              <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b" className="rounded-lg overflow-hidden"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
