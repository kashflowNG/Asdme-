
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function ClickHeatmap() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/detailed"],
  });

  const getHeatColor = (clicks: number) => {
    if (clicks > 100) return "bg-gradient-to-r from-red-500 to-orange-500";
    if (clicks > 50) return "bg-gradient-to-r from-orange-500 to-yellow-500";
    if (clicks > 20) return "bg-gradient-to-r from-yellow-500 to-emerald-500";
    return "bg-gradient-to-r from-blue-500 to-cyan-500";
  };

  return (
    <Card className="p-6 glass-card neon-glow">
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-bold">Performance Heatmap</h3>
      </div>
      
      <div className="space-y-2">
        {analytics?.topLinks?.map((link, idx) => {
          const intensity = Math.min((link.clicks / (analytics.topLinks[0]?.clicks || 1)) * 100, 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{link.platform}</span>
                <span className="text-muted-foreground">{link.clicks} clicks</span>
              </div>
              <div className="h-8 rounded-lg overflow-hidden bg-muted/30">
                <div
                  className={`h-full ${getHeatColor(link.clicks)} transition-all duration-500 flex items-center justify-end px-3`}
                  style={{ width: `${intensity}%` }}
                >
                  {intensity > 15 && (
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {Math.round(intensity)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
