import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit2, Save, X } from "lucide-react";

interface Style {
  id: string;
  name: string;
  description: string;
  css: string;
  preview: string;
  pointCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function StylesManager() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    css: '',
    preview: '',
    pointCost: 100,
  });

  const { data: allStyles = [] } = useQuery<Style[]>({
    queryKey: ["/api/admin/styles"],
  });

  const createStyleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/styles", data),
    onSuccess: () => {
      setForm({ name: '', description: '', css: '', preview: '', pointCost: 100 });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/styles"] });
      toast({ title: "Style created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create style", variant: "destructive" });
    },
  });

  const updateStyleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/admin/styles/${id}`, data),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/styles"] });
      toast({ title: "Style updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update style", variant: "destructive" });
    },
  });

  const deleteStyleMutation = useMutation({
    mutationFn: (styleId: string) => apiRequest("DELETE", `/api/admin/styles/${styleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/styles"] });
      toast({ title: "Style deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete style", variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!form.name || !form.css) {
      toast({ title: "Error", description: "Name and CSS are required", variant: "destructive" });
      return;
    }
    createStyleMutation.mutate(form);
  };

  const handleEditClick = (style: Style) => {
    setEditingId(style.id);
    setForm({
      name: style.name,
      description: style.description,
      css: style.css,
      preview: style.preview,
      pointCost: style.pointCost,
    });
  };

  const handleSaveEdit = (styleId: string) => {
    if (!form.name || !form.css) {
      toast({ title: "Error", description: "Name and CSS are required", variant: "destructive" });
      return;
    }
    updateStyleMutation.mutate({ id: styleId, data: form });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', description: '', css: '', preview: '', pointCost: 100 });
  };

  return (
    <div className="space-y-6">
      {/* Create Style Form */}
      {editingId === null && (
        <Card className="p-4 sm:p-6 bg-slate-800/30 border-primary/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Create New Style
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Style Name</label>
              <Input
                placeholder="e.g., Neon Glow Effect"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800/50 border-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
              <Input
                placeholder="e.g., Glowing borders and animations"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-slate-800/50 border-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Custom CSS</label>
              <Textarea
                placeholder="/* Add your custom CSS here */&#10;.link-button {&#10;  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);&#10;  transition: all 0.3s ease;&#10;}"
                value={form.css}
                onChange={(e) => setForm({ ...form, css: e.target.value })}
                className="bg-slate-800/50 border-primary/20 min-h-32 font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Preview Image URL (Optional)</label>
                <Input
                  placeholder="https://example.com/preview.jpg"
                  value={form.preview}
                  onChange={(e) => setForm({ ...form, preview: e.target.value })}
                  className="bg-slate-800/50 border-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Point Cost</label>
                <Input
                  type="number"
                  min="10"
                  value={form.pointCost}
                  onChange={(e) => setForm({ ...form, pointCost: parseInt(e.target.value) })}
                  className="bg-slate-800/50 border-primary/20"
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={!form.name || !form.css || createStyleMutation.isPending}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Create Style
            </Button>
          </div>
        </Card>
      )}

      {/* Styles List */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">All Styles ({allStyles.length})</h3>
        {allStyles.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No styles created yet</div>
        ) : (
          <div className="space-y-3">
            {allStyles.map((style) => (
              <Card key={style.id} className="p-4 bg-slate-800/30 border-primary/20">
                {editingId === style.id ? (
                  <div className="space-y-4">
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="bg-slate-800/50 border-primary/20 font-bold"
                      placeholder="Style name"
                    />
                    <Input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="bg-slate-800/50 border-primary/20"
                      placeholder="Description"
                    />
                    <Textarea
                      value={form.css}
                      onChange={(e) => setForm({ ...form, css: e.target.value })}
                      className="bg-slate-800/50 border-primary/20 min-h-32 font-mono text-xs"
                      placeholder="CSS"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="10"
                        value={form.pointCost}
                        onChange={(e) => setForm({ ...form, pointCost: parseInt(e.target.value) })}
                        className="bg-slate-800/50 border-primary/20"
                        placeholder="Price"
                      />
                      <Input
                        value={form.preview}
                        onChange={(e) => setForm({ ...form, preview: e.target.value })}
                        className="bg-slate-800/50 border-primary/20 text-xs"
                        placeholder="Preview URL"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(style.id)}
                        disabled={updateStyleMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-white">{style.name}</h4>
                        {!style.isActive && (
                          <Badge className="text-xs bg-gray-600">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{style.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">💎 {style.pointCost} points</Badge>
                        {style.css && (
                          <Badge variant="outline" className="text-xs bg-primary/10">CSS</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(style)}
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteStyleMutation.mutate(style.id)}
                        disabled={deleteStyleMutation.isPending}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
