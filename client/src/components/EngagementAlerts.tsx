
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap } from "lucide-react";

export function EngagementAlerts() {
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time alerts
    const alerts = [
      "🔥 Your Instagram link got 5 clicks in the last hour!",
      "⚡ 23% increase in profile views today",
      "🎯 YouTube link is trending - 89% click rate",
      "💫 Best performing day this week!"
    ];

    const interval = setInterval(() => {
      setAlert(alerts[Math.floor(Math.random() * alerts.length)]);
      setTimeout(() => setAlert(null), 5000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!alert) return null;

  return (
    <Card className="p-4 glass-card border-2 border-primary/30 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-lg">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm font-medium flex-1">{alert}</p>
        <Badge className="bg-gradient-to-r from-primary/20 to-cyan-500/20">
          <TrendingUp className="w-3 h-3" />
        </Badge>
      </div>
    </Card>
  );
}
