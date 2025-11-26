import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Gift, Sparkles } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  badge: string | null;
  badgeColor: string;
  category: string | null;
  usageCount: number;
}

const CHRISTMAS_TEMPLATE = {
  name: "🎄 Christmas Special",
  description: "Festive Christmas landing page with WhatsApp chat bubble style",
  badge: "Holiday",
  badgeColor: "#DC2626",
  category: "seasonal",
  htmlContent: `<div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0d1b2a 0%, #1a3a52 100%); min-height: 100vh; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; display: flex; flex-direction: column; justify-content: center;"><div style="text-align: center; margin-bottom: 32px;"><div style="font-size: 48px; margin-bottom: 16px;">🎄✨</div><h1 style="color: #fff; font-size: 28px; margin: 0 0 8px 0; font-weight: bold;">Merry Christmas!</h1><p style="color: #a3e635; font-size: 14px; margin: 0;">Wishing you joy, peace & happiness</p></div><div style="space-y: 16px;"><div style="background: #1f2937; border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; max-width: 85%; word-wrap: break-word;"><p style="color: #e5e7eb; font-size: 15px; margin: 0; line-height: 1.4;">🎁 Special holiday offers just for you!</p></div><div style="background: #059669; border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; max-width: 85%; margin-left: auto; word-wrap: break-word;"><p style="color: #fff; font-size: 15px; margin: 0; line-height: 1.4;">✨ Get up to 50% off this season</p></div><div style="background: #1f2937; border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; max-width: 85%; word-wrap: break-word;"><p style="color: #e5e7eb; font-size: 15px; margin: 0; line-height: 1.4;">🎅 Limited time only - Shop now!</p></div><div style="background: #dc2626; border-radius: 18px; padding: 14px 16px; margin-bottom: 20px; max-width: 85%; margin-left: auto; word-wrap: break-word;"><p style="color: #fff; font-size: 15px; margin: 0; line-height: 1.4;">⏰ Offer ends Dec 25th</p></div></div><button style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; border: none; padding: 12px 24px; border-radius: 24px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; margin-bottom: 12px; transition: transform 0.2s;">🎁 Claim Your Gift</button><button style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border: none; padding: 12px 24px; border-radius: 24px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; transition: transform 0.2s;">✨ Shop Holiday Deals</button><div style="text-align: center; margin-top: 24px; color: #a3e635; font-size: 12px;"><p>🕯️ Spread joy this holiday season 🕯️</p></div></div>`,
};

const NEW_YEAR_TEMPLATE = {
  name: "🎆 New Year Fresh Start",
  description: "Energetic New Year 2025 landing page with WhatsApp chat bubble style",
  badge: "2025",
  badgeColor: "#1e40af",
  category: "seasonal",
  htmlContent: `<div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%); min-height: 100vh; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; display: flex; flex-direction: column; justify-content: center;"><div style="text-align: center; margin-bottom: 32px;"><div style="font-size: 48px; margin-bottom: 16px;">🎆🚀</div><h1 style="color: #fff; font-size: 28px; margin: 0 0 8px 0; font-weight: bold;">Happy New Year 2025!</h1><p style="color: #06b6d4; font-size: 14px; margin: 0;">Time for new beginnings & fresh goals</p></div><div style="space-y: 16px;"><div style="background: #1e293b; border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; max-width: 85%; word-wrap: break-word;"><p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.4;">🎯 Set your goals for 2025</p></div><div style="background: #0369a1; border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; max-width: 85%; margin-left: auto; word-wrap: break-word;"><p style="color: #fff; font-size: 15px; margin: 0; line-height: 1.4;">💪 Achieve your dreams with us</p></div><div style="background: #1e293b; border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; max-width: 85%; word-wrap: break-word;"><p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.4;">✨ Start your journey today</p></div><div style="background: #06b6d4; border-radius: 18px; padding: 14px 16px; margin-bottom: 20px; max-width: 85%; margin-left: auto; word-wrap: break-word;"><p style="color: #fff; font-size: 15px; margin: 0; line-height: 1.4;">🎊 Exclusive NY deals inside</p></div></div><button style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; border: none; padding: 12px 24px; border-radius: 24px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; margin-bottom: 12px; transition: transform 0.2s;">🚀 Start Your 2025 Journey</button><button style="background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%); color: white; border: none; padding: 12px 24px; border-radius: 24px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; transition: transform 0.2s;">💎 Unlock NY Special Offers</button><div style="text-align: center; margin-top: 24px; color: #06b6d4; font-size: 12px;"><p>✨ 365 days of possibilities ahead ✨</p></div></div>`,
};


export function TemplateManager() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    htmlContent: "",
    preview: "",
    badge: "",
    badgeColor: "#8B5CF6",
    category: "general",
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates"],
    queryFn: () => apiRequest("GET", "/api/templates"),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/admin/templates/create", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Template created" });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        htmlContent: "",
        preview: "",
        badge: "",
        badgeColor: "#8B5CF6",
        category: "general",
      });
    },
    onError: () => toast({ title: "Error", description: "Failed to create template", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/templates/${id}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Template deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete template", variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.htmlContent) {
      toast({ title: "Error", description: "Name and HTML content required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const loadPresetTemplate = (template: typeof CHRISTMAS_TEMPLATE) => {
    setFormData({
      name: template.name,
      description: template.description,
      htmlContent: template.htmlContent,
      preview: "",
      badge: template.badge,
      badgeColor: template.badgeColor,
      category: template.category,
    });
  };

  const deployTemplate = async (template: typeof CHRISTMAS_TEMPLATE) => {
    try {
      await apiRequest("POST", "/api/admin/templates/create", {
        name: template.name,
        description: template.description,
        htmlContent: template.htmlContent,
        preview: "",
        badge: template.badge,
        badgeColor: template.badgeColor,
        category: template.category,
      });
      toast({ title: "Success", description: `${template.name} deployed to users!` });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    } catch {
      toast({ title: "Error", description: "Failed to deploy template", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Templates Section */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
        <h3 className="text-lg font-semibold mb-4">📦 Preset Seasonal Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-red-700">🎄 Christmas</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Holiday offers & festive theme</p>
              </div>
              <Gift className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => loadPresetTemplate(CHRISTMAS_TEMPLATE)} className="flex-1">
                Customize
              </Button>
              <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => deployTemplate(CHRISTMAS_TEMPLATE)}>
                Deploy Now
              </Button>
            </div>
          </Card>

          <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-blue-700">🎆 New Year</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">2025 goals & fresh start theme</p>
              </div>
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => loadPresetTemplate(NEW_YEAR_TEMPLATE)} className="flex-1">
                Customize
              </Button>
              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => deployTemplate(NEW_YEAR_TEMPLATE)}>
                Deploy Now
              </Button>
            </div>
          </Card>
        </div>
      </Card>

      {/* Existing Templates Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Custom Templates</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Ready-Made Template</DialogTitle>
              <DialogDescription>Add a new template for users to apply</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Purple Neon"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Badge Text</Label>
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., Premium"
                  />
                </div>
                <div>
                  <Label>Badge Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.badgeColor}
                      onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      className="h-10 w-16 border rounded cursor-pointer"
                    />
                    <Input value={formData.badgeColor} readOnly className="flex-1" />
                  </div>
                </div>
              </div>
              <div>
                <Label>HTML Content</Label>
                <Textarea
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  placeholder="<div>Your template HTML...</div>"
                  className="h-32 font-mono text-xs"
                />
              </div>
              <div>
                <Label>Preview Image URL</Label>
                <Input
                  value={formData.preview}
                  onChange={(e) => setFormData({ ...formData, preview: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {createMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template: Template) => (
          <Card key={template.id} className="p-4 space-y-3 border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{template.name}</h4>
                {template.description && <p className="text-sm text-gray-600">{template.description}</p>}
              </div>
              {template.badge && (
                <Badge style={{ backgroundColor: template.badgeColor }} className="text-white ml-2">
                  {template.badge}
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500">
              <p>Used {template.usageCount} times</p>
              {template.category && <p className="capitalize">Category: {template.category}</p>}
            </div>
            <Button
              onClick={() => deleteMutation.mutate(template.id)}
              disabled={deleteMutation.isPending}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No templates created yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
