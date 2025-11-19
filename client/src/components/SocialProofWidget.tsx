
import { Card } from "@/components/ui/card";
import { Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SocialProofWidgetProps {
  username: string;
}

export function SocialProofWidget({ username }: SocialProofWidgetProps) {
  const { data: analytics } = useQuery({
    queryKey: ["/api/profiles", username, "analytics"],
  });

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Card className="p-4 text-center glass-card border-primary/20">
        <Eye className="w-5 h-5 mx-auto mb-2 text-primary" />
        <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
        <div className="text-xs text-muted-foreground">Views</div>
      </Card>
      <Card className="p-4 text-center glass-card border-cyan-500/20">
        <MousePointerClick className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
        <div className="text-2xl font-bold">{analytics?.totalClicks || 0}</div>
        <div className="text-xs text-muted-foreground">Clicks</div>
      </Card>
      <Card className="p-4 text-center glass-card border-pink-500/20">
        <TrendingUp className="w-5 h-5 mx-auto mb-2 text-pink-400" />
        <div className="text-2xl font-bold">
          {analytics?.totalViews ? Math.round((analytics.totalClicks / analytics.totalViews) * 100) : 0}%
        </div>
        <div className="text-xs text-muted-foreground">CTR</div>
      </Card>
    </div>
  );
}
