
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const templates = [
  { id: "minimal", name: "Minimal", preview: "/templates/minimal.png" },
  { id: "neon", name: "Neo-Neon", preview: "/templates/neon.png" },
  { id: "gradient", name: "Gradient Dream", preview: "/templates/gradient.png" },
  { id: "glass", name: "Glassmorphism", preview: "/templates/glass.png" },
];

export function TemplateSelector() {
  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card">
      <div className="flex items-center gap-3">
        <Palette className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Quick Templates</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative aspect-video rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 cursor-pointer transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-bold text-lg">{template.name}</span>
            </div>
            <Button
              size="sm"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Apply
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
