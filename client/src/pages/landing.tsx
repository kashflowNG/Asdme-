
import { Button } from "@/components/ui/button";
import { NeropageLogo } from "@/components/NeropageLogo";
import { ArrowRight, Sparkles, Zap, Shield, Users, TrendingUp, Lock, Globe, BarChart3, Palette, Link2, CheckCircle, Rocket, Eye, Gauge, Code } from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function Landing() {
  const [, navigate] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "1M+", label: "Links Shared" },
    { value: "99.9%", label: "Uptime" },
    { value: "50+", label: "Integrations" }
  ];

  const capabilities = [
    { icon: Rocket, title: "Lightning Fast", description: "Deploy instantly with zero configuration", color: "from-blue-500 to-cyan-400" },
    { icon: Eye, title: "Real-Time Analytics", description: "Track clicks, views, and engagement instantly", color: "from-purple-500 to-pink-400" },
    { icon: Gauge, title: "Performance Tracking", description: "Detailed insights on link performance", color: "from-orange-500 to-red-400" },
    { icon: Code, title: "Custom Code", description: "Add HTML embeds, custom CSS, and more", color: "from-green-500 to-emerald-400" }
  ];

  const faqs = [
    { q: "Can I use my own domain?", a: "Yes! Connect any custom domain to your Neropage profile for a professional presence." },
    { q: "Is there a free plan?", a: "Absolutely! Get started free with unlimited links and basic customization. No credit card needed." },
    { q: "How do I track my performance?", a: "Use our advanced analytics dashboard to see real-time clicks, views, locations, and more." },
    { q: "Can I customize my page design?", a: "Completely! Choose from 8+ themes, 27+ fonts, customize colors, add videos, and write custom CSS." },
    { q: "Do you offer support?", a: "Yes! We offer email support and documentation. Pro users get priority support." }
  ];

  return (
    <>
      <Helmet>
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

        {/* Capabilities Showcase */}
        <div className="max-w-6xl w-full mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, i) => (
              <div
                key={i}
                className="glass-card p-8 rounded-2xl hover-elevate transition-all border border-primary/20"
                style={{
                  animation: `fadeIn 0.6s ease-out ${1.5 + i * 0.1}s both`,
                }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cap.color} p-3 mb-4 neon-glow`}>
                  <cap.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{cap.title}</h3>
                <p className="text-muted-foreground">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Showcase */}
        <div className="max-w-6xl w-full mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Perfect For Every Creator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="p-6 glass-card neon-glow hover-elevate transition-all"
              style={{
                animation: `fadeIn 0.6s ease-out 1.2s both`,
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Content Creators</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Consolidate all your social media profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Track which platforms drive the most engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Customize branding to match your style</span>
                </li>
              </ul>
            </Card>

            <Card 
              className="p-6 glass-card neon-glow hover-elevate transition-all"
              style={{
                animation: `fadeIn 0.6s ease-out 1.3s both`,
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Business & Brands</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Drive traffic to your products and services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Use custom domains for professional presence</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Analyze customer behavior with detailed analytics</span>
                </li>
              </ul>
            </Card>

            <Card 
              className="p-6 glass-card neon-glow hover-elevate transition-all"
              style={{
                animation: `fadeIn 0.6s ease-out 1.4s both`,
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Artists & Musicians</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Showcase your portfolio and latest work</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Link to streaming platforms and merchandise</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Engage fans with custom HTML content blocks</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl w-full mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card rounded-xl overflow-hidden transition-all"
                style={{
                  animation: `fadeIn 0.6s ease-out ${2.0 + i * 0.1}s both`,
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-primary/5 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.q}</span>
                  <div className={`text-primary transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6 text-muted-foreground border-t border-primary/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Premium Features Teaser */}
        <div className="max-w-4xl w-full mb-20 relative">
          <div className="glass-card border-2 border-primary/30 rounded-2xl p-12 text-center relative overflow-hidden">
            <div 
              className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <div className="inline-block px-4 py-2 bg-primary/20 rounded-full mb-6 text-sm font-semibold text-primary">
                ✨ Premium Features Available
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Unlock Advanced Features
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
                Access priority support, advanced analytics, team collaboration, and exclusive templates with Neropage Pro
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-lg neon-glow hover:neon-glow-strong transition-all"
                  onClick={() => navigate('/signup')}
                >
                  Start Free Trial
                  <Rocket className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/login')}
                >
                  Already have an account?
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-2xl w-full text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Your Digital Presence Starts Here
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Create, customize, and share your Neropage profile in minutes
          </p>
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
