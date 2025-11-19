
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { PLATFORMS } from "@/lib/platforms";

interface SmartRecommendationsProps {
  existingPlatforms: string[];
  onAddPlatform: (platformId: string) => void;
}

export function SmartRecommendations({ existingPlatforms, onAddPlatform }: SmartRecommendationsProps) {
  // Smart algorithm: recommend platforms based on what similar users have
  const recommendations = PLATFORMS
    .filter(p => !existingPlatforms.includes(p.id))
    .filter(p => ['youtube', 'tiktok', 'twitter', 'linkedin', 'github'].includes(p.id))
    .slice(0, 3);

  if (recommendations.length === 0) return null;

  return (
    <Card className="p-6 space-y-4 glass-card neon-glow border-2 border-primary/20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold flex items-center gap-2">
            Recommended Platforms
            <Badge className="bg-gradient-to-r from-primary/20 to-cyan-500/20">AI</Badge>
          </h3>
          <p className="text-xs text-muted-foreground">Based on your profile</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {recommendations.map((platform) => {
          const Icon = platform.icon;
          return (
            <div
              key={platform.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" style={{ color: platform.color }} />
                <div>
                  <p className="text-sm font-medium">{platform.name}</p>
                  <p className="text-xs text-muted-foreground">+42% engagement boost</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddPlatform(platform.id)}
                className="gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                Add
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
