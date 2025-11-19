
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";

export function ABTestManager() {
  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card">
      <div className="flex items-center gap-3">
        <FlaskConical className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">A/B Testing</h2>
        <Badge className="bg-gradient-to-r from-primary/20 to-cyan-500/20">PRO</Badge>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-4">
          Test different versions of your links to optimize engagement
        </p>
        <Button className="w-full">
          Create Split Test
        </Button>
      </div>
    </Card>
  );
}
