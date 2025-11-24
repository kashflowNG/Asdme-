
import { Button } from "@/components/ui/button";
import { NeropageLogo } from "@/components/NeropageLogo";
import { ArrowRight, Sparkles, Zap, Shield, Users, TrendingUp, Lock, Globe, BarChart3, Palette, Link2, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Sparkles,
      title: "Stunning Design",
      description: "Neo-neon aesthetics that make your profile stand out in the digital cosmos",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Blazing performance with offline-first PWA technology",
      color: "text-cyan-400"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data protected with enterprise-grade security",
      color: "text-pink-400"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track clicks, views, and engagement with detailed insights",
      color: "text-purple-400"
    },
    {
      icon: Palette,
      title: "Full Customization",
      description: "Customize colors, fonts, layouts, and templates to match your brand",
      color: "text-emerald-400"
    },
    {
      icon: Globe,
      title: "Custom Domains",
      description: "Use your own domain name for a professional presence",
      color: "text-blue-400"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      image: "🎨",
      quote: "Neropage transformed my online presence. The analytics help me understand my audience better!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Musician",
      image: "🎵",
      quote: "The neon aesthetic perfectly matches my brand. My engagement has doubled since switching!"
    },
    {
      name: "Aisha Patel",
      role: "Entrepreneur",
      image: "💼",
      quote: "Clean, fast, and powerful. Everything I need to manage my business links in one place."
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "1M+", label: "Links Shared" },
    { value: "99.9%", label: "Uptime" },
    { value: "50+", label: "Integrations" }
  ];

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
        <p className="text-xl md:text-2xl text-muted-foreground text-center mb-8 max-w-2xl">
          The <span className="text-primary font-semibold">neo-neon</span> link platform that unites your digital universe
        </p>

        {/* Value proposition */}
        <p className="text-base text-muted-foreground text-center mb-12 max-w-xl">
          Create a stunning, customizable landing page for all your links. Track analytics, engage your audience, and grow your brand.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-lg neon-glow hover:neon-glow-strong transition-all"
            onClick={() => navigate('/signup')}
            data-testid="button-get-started"
          >
            Get Started Free
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

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-4xl w-full">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className="text-center"
              style={{
                animation: `fadeIn 0.6s ease-out ${i * 0.1}s both`,
              }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-16">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="glass-card p-6 rounded-xl hover-elevate transition-all"
              style={{
                animation: `fadeIn 0.6s ease-out ${0.2 + i * 0.1}s both`,
              }}
            >
              <div className={`w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 neon-glow`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl w-full mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Why Choose Neropage?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Unlimited links and customization",
              "Real-time analytics and insights",
              "Mobile-optimized and responsive",
              "SEO-friendly URLs",
              "Custom branding options",
              "Priority support",
              "No hidden fees",
              "Regular feature updates"
            ].map((benefit, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg glass-card"
                style={{
                  animation: `fadeIn 0.6s ease-out ${0.8 + i * 0.05}s both`,
                }}
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl w-full mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Loved by Creators Worldwide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card 
                key={i}
                className="p-6 glass-card neon-glow hover-elevate transition-all"
                style={{
                  animation: `fadeIn 0.6s ease-out ${1.2 + i * 0.1}s both`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">"{testimonial.quote}"</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-2xl w-full text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Unite Your Digital Presence?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of creators who trust Neropage to showcase their content
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-lg neon-glow hover:neon-glow-strong transition-all"
            onClick={() => navigate('/signup')}
          >
            Start Building Your Page
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-sm text-muted-foreground text-center mb-8">
          Free to start · No credit card required
        </p>

        {/* Ad Placement */}
        <div className="flex justify-center py-6">
          <div className="w-full max-w-sm mx-auto">
            <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b" className="rounded-lg overflow-hidden"></div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
