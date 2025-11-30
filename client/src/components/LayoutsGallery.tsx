import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Grid3x3, Minimize2, Check } from "lucide-react";

export const LAYOUT_OPTIONS = [
  {
    id: "stacked",
    name: "Stacked",
    description: "Traditional single-column layout. Perfect for focused content flow.",
    icon: LayoutGrid,
    preview: "flex flex-col space-y-3 p-4 bg-slate-900 rounded-lg",
    features: ["Single column", "Vertical scrolling", "Best for lists"]
  },
  {
    id: "grid",
    name: "Grid",
    description: "Multi-column grid layout. Great for showcasing multiple items side-by-side.",
    icon: Grid3x3,
    preview: "grid grid-cols-2 gap-2 p-4 bg-slate-900 rounded-lg",
    features: ["Multi-column", "Responsive grid", "Best for portfolios"]
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, centered minimal design. Elegant and distraction-free.",
    icon: Minimize2,
    preview: "flex flex-col items-center space-y-2 p-4 bg-slate-900 rounded-lg",
    features: ["Centered layout", "Minimal distractions", "Best for professionals"]
  }
];

interface LayoutsGalleryProps {
  selectedLayout?: string;
  onSelectLayout?: (layoutId: string) => void;
  viewOnly?: boolean;
}

export function LayoutsGallery({ selectedLayout, onSelectLayout, viewOnly = false }: LayoutsGalleryProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Available Layouts</h3>
        <p className="text-sm text-gray-400">Choose how your public landing page will look</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LAYOUT_OPTIONS.map((layout) => {
          const IconComponent = layout.icon;
          const isSelected = selectedLayout === layout.id;
          
          return (
            <Card
              key={layout.id}
              className={`relative overflow-hidden border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-primary/20 bg-slate-800/30 hover:border-primary/40"
              }`}
              onClick={() => !viewOnly && onSelectLayout?.(layout.id)}
            >
              {/* Header with Icon */}
              <div className="p-4 border-b border-primary/10 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{layout.name}</h4>
                    <p className="text-xs text-gray-400">{layout.id}</p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                )}
              </div>

              {/* Preview */}
              <div className={`${layout.preview}`}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded ${
                      layout.id === "grid" && i === 2 ? "col-span-2" : ""
                    }`}
                  />
                ))}
              </div>

              {/* Description */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-300">{layout.description}</p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {layout.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      className="text-xs bg-primary/10 text-cyan-300 border-primary/30"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              {!viewOnly && (
                <div className="p-4 border-t border-primary/10">
                  <Button
                    onClick={() => onSelectLayout?.(layout.id)}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    {isSelected ? "Selected" : "Choose Layout"}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
