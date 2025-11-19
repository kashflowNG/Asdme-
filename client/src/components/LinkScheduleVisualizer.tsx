
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface ScheduledLink {
  platform: string;
  scheduleStart?: string;
  scheduleEnd?: string;
}

interface LinkScheduleVisualizerProps {
  links: ScheduledLink[];
}

export function LinkScheduleVisualizer({ links }: LinkScheduleVisualizerProps) {
  const scheduledLinks = links.filter(l => l.scheduleStart && l.scheduleEnd);

  if (scheduledLinks.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isActive = (start: string, end: string) => {
    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
  };

  return (
    <Card className="p-6 glass-card neon-glow">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Scheduled Links</h3>
      </div>
      
      <div className="space-y-3">
        {scheduledLinks.map((link, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{link.platform}</span>
              {isActive(link.scheduleStart!, link.scheduleEnd!) ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline">Scheduled</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(link.scheduleStart!)}</span>
              <span>→</span>
              <span>{formatDate(link.scheduleEnd!)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
