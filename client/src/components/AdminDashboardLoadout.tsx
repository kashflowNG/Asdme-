import { Sparkles, Users, Link2, Eye, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoadoutProps {
  totalUsers: number;
  totalLinks: number;
  totalViews: number;
  uniqueCountries: number;
}

export function AdminDashboardLoadout({ totalUsers, totalLinks, totalViews, uniqueCountries }: LoadoutProps) {
  const stats = [
    {
      icon: Users,
      label: "Platform Users",
      value: totalUsers,
      color: "from-cyan-500 to-cyan-400",
      glowColor: "rgba(6, 182, 212, 0.3)",
      accentColor: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: Link2,
      label: "Total Links",
      value: totalLinks,
      color: "from-purple-500 to-pink-400",
      glowColor: "rgba(139, 92, 246, 0.3)",
      accentColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Eye,
      label: "Profile Views",
      value: totalViews,
      color: "from-pink-500 to-rose-400",
      glowColor: "rgba(236, 72, 153, 0.3)",
      accentColor: "text-pink-400",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: Zap,
      label: "Countries",
      value: uniqueCountries,
      color: "from-blue-500 to-blue-400",
      glowColor: "rgba(59, 130, 246, 0.3)",
      accentColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="relative z-10">
      {/* Header with glow effect */}
      <div className="mb-8 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 animate-pulse"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Platform Loadout
            </h1>
          </div>
          <p className="text-muted-foreground">Real-time platform metrics and activity overview</p>
        </div>
      </div>

      {/* Stats Grid with glowing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="relative group">
              {/* Animated glow background */}
              <div
                className="absolute -inset-0.5 bg-gradient-to-r rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse"
                style={{
                  background: `linear-gradient(135deg, ${stat.color})`,
                  animationDelay: `${idx * 0.2}s`,
                }}
              ></div>

              {/* Card content */}
              <Card className="relative p-6 glass-card border-purple-500/20 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-xl overflow-hidden group">
                {/* Inner gradient glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${stat.glowColor})` }}></div>

                {/* Icon with animation */}
                <div className={`w-14 h-14 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${stat.accentColor} animate-float`} style={{ animationDelay: `${idx * 0.3}s` }} />
                </div>

                {/* Label */}
                <p className="text-sm text-muted-foreground mb-2 font-medium">{stat.label}</p>

                {/* Value with glow effect */}
                <div className="relative">
                  <p className={`text-4xl font-bold ${stat.accentColor} drop-shadow-lg`} style={{ textShadow: `0 0 20px ${stat.glowColor}` }}>
                    {stat.value}
                  </p>
                </div>

                {/* Shine effect */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Status indicator */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-30"></div>
        <div className="relative bg-slate-900/50 backdrop-blur-md border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-sm text-emerald-300">System Status: All Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
