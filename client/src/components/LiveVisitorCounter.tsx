
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface LiveVisitorCounterProps {
  username: string;
}

export function LiveVisitorCounter({ username }: LiveVisitorCounterProps) {
  const [liveCount, setLiveCount] = useState(1);

  useEffect(() => {
    // Simulate real-time visitor count (in production, this would use WebSockets)
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      setLiveCount((prev) => Math.max(1, Math.min(prev + random, 50)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
        <Eye className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-medium text-emerald-400">{liveCount}</span>
        <span className="text-xs text-emerald-400/80">viewing now</span>
      </div>
    </div>
  );
}
