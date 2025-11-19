
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Eye, MousePointerClick, Link2, TrendingUp } from "lucide-react";

export function AnalyticsDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const stats = [
    {
      label: "Profile Views",
      value: analytics?.views || 0,
      icon: Eye,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Clicks",
      value: analytics?.totalClicks || 0,
      icon: MousePointerClick,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Active Links",
      value: analytics?.linkCount || 0,
      icon: Link2,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
    },
    {
      label: "Engagement Rate",
      value: analytics?.views ? `${Math.round((analytics.totalClicks / analytics.views) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4 glass-card neon-glow">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        );
      })}
    </div>
  );
}
