
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink, TrendingUp } from "lucide-react";

interface LinkPreviewCardProps {
  url: string;
  platform: string;
  clicks?: number;
}

export function LinkPreviewCard({ url, platform, clicks = 0 }: LinkPreviewCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      {showPreview && (
        <Card className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-4 w-64 glass-card neon-glow z-50 animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">{platform}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{url}</p>
            {clicks > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">{clicks}</span>
                <span className="text-muted-foreground">clicks this week</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
