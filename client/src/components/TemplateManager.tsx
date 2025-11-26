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
import { Plus, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  badge: string | null;
  badgeColor: string;
  category: string | null;
  usageCount: number;
}

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ready-Made Templates</h3>
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
