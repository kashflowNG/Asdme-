import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  preview: string | null;
  badge: string | null;
  badgeColor: string | null;
  category: string | null;
  usageCount: number;
}

export function TemplateBrowser() {
  const { toast } = useToast();
  const [applying, setApplying] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates"],
    queryFn: () => apiRequest("GET", "/api/templates"),
  });

  const handleApplyTemplate = async (templateId: string, name: string) => {
    setApplying(templateId);
    try {
      await apiRequest("POST", "/api/profile/apply-template", { templateId });
      toast({ title: "Success", description: `Applied "${name}" template` });
      window.location.reload();
    } catch (error) {
      toast({ title: "Error", description: "Failed to apply template", variant: "destructive" });
    } finally {
      setApplying(null);
    }
  };

  if (isLoading) return <div className="p-4">Loading templates...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden border-purple-200 hover:border-purple-400 transition-colors">
            {template.preview && (
              <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                <img src={template.preview} alt={template.name} className="w-full h-full object-cover opacity-70" />
                {template.badge && (
                  <div className="absolute top-2 right-2">
                    <Badge style={{ backgroundColor: template.badgeColor || "#8B5CF6" }} className="text-white">
                      {template.badge}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{template.name}</h3>
                {template.description && <p className="text-sm text-gray-600">{template.description}</p>}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Used {template.usageCount} times</span>
                {template.category && <span className="capitalize">{template.category}</span>}
              </div>
              <Button
                onClick={() => handleApplyTemplate(template.id, template.name)}
                disabled={applying === template.id}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {applying === template.id ? "Applying..." : "Apply Template"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No templates available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
