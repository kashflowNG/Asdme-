
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Eye, MousePointerClick, Link2, TrendingUp, Users, Mail, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function AnalyticsDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/detailed"],
  });

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const csv = [
      ['Metric', 'Value'],
      ['Total Views', analytics.totalViews || 0],
      ['Total Clicks', analytics.totalClicks || 0],
      ['Active Links', analytics.linkCount || 0],
      ['Engagement Rate', analytics.totalViews ? `${Math.round((analytics.totalClicks / analytics.totalViews) * 100)}%` : '0%'],
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neropage-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = [
    {
      label: "Profile Views",
      value: analytics?.totalViews || 0,
      icon: Eye,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
    },
    {
      label: "Total Clicks",
      value: analytics?.totalClicks || 0,
      icon: MousePointerClick,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      change: "+8%",
    },
    {
      label: "Active Links",
      value: analytics?.linkCount || 0,
      icon: Link2,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      change: "—",
    },
    {
      label: "Engagement Rate",
      value: analytics?.totalViews ? `${Math.round((analytics.totalClicks / analytics.totalViews) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      change: "+5%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 glass-card neon-glow hover-elevate transition-all">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3 animate-float`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-xs text-emerald-400 font-medium">{stat.change}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Top Performing Links */}
      {analytics?.topLinks && analytics.topLinks.length > 0 && (
        <Card className="p-6 glass-card neon-glow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top Performing Links
          </h3>
          <div className="space-y-3">
            {analytics.topLinks.map((link, idx) => {
              const maxClicks = analytics.topLinks[0]?.clicks || 1;
              const percentage = (link.clicks / maxClicks) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate flex-1">{link.platform}</span>
                    <span className="text-muted-foreground ml-2">{link.clicks} clicks</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {analytics?.recentViews && analytics.recentViews.length > 0 && (
        <Card className="p-6 glass-card neon-glow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Recent Visitors
          </h3>
          <div className="space-y-2">
            {analytics.recentViews.slice(0, 5).map((view, idx) => {
              const date = new Date(view.timestamp);
              const timeAgo = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
              return (
                <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-muted-foreground">
                      {timeAgo < 1 ? "Just now" : timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`}
                    </span>
                  </div>
                  {view.referrer && (
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      from {new URL(view.referrer).hostname}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Form Submissions */}
      {analytics?.formSubmissions !== undefined && analytics.formSubmissions > 0 && (
        <Card className="p-6 glass-card neon-glow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{analytics.formSubmissions}</div>
              <div className="text-sm text-muted-foreground">Form Submissions</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
