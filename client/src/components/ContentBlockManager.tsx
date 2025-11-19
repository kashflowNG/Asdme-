import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ContentBlock } from "@shared/schema";
import { Plus, Video, Image as ImageIcon, FileText, Code, Mail, Trash2, GripVertical } from "lucide-react";

const blockTypes = [
  { id: "video", name: "Video Embed", icon: Video, description: "YouTube, Vimeo, TikTok" },
  { id: "image", name: "Image", icon: ImageIcon, description: "Single image display" },
  { id: "gallery", name: "Image Gallery", icon: ImageIcon, description: "Multiple images" },
  { id: "text", name: "Text Block", icon: FileText, description: "Rich text content" },
  { id: "embed", name: "Custom Embed", icon: Code, description: "HTML embed code" },
  { id: "form", name: "Email Form", icon: Mail, description: "Lead collection" },
  { id: "music", name: "Music Player", icon: Video, description: "Spotify, SoundCloud" },
  { id: "podcast", name: "Podcast Episode", icon: Video, description: "Audio podcast embed" },
  { id: "testimonial", name: "Testimonial", icon: FileText, description: "Customer reviews" },
  { id: "faq", name: "FAQ Section", icon: FileText, description: "Questions & Answers" },
];

export function ContentBlockManager() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("video");
  const [blockData, setBlockData] = useState({
    title: "",
    content: "",
    mediaUrl: "",
  });

  const { data: blocks = [] } = useQuery<ContentBlock[]>({
    queryKey: ["/api/content-blocks"],
  });

  const createBlockMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      title?: string;
      content?: string;
      mediaUrl?: string;
      order: number;
    }) => {
      return await apiRequest("POST", "/api/content-blocks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-blocks"] });
      setShowAddDialog(false);
      setBlockData({ title: "", content: "", mediaUrl: "" });
      toast({
        title: "Content block added",
        description: "Your content block has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add content block",
        variant: "destructive",
      });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/content-blocks/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-blocks"] });
      toast({
        title: "Content block removed",
        description: "The content block has been removed.",
      });
    },
  });

  const handleAddBlock = () => {
    createBlockMutation.mutate({
      type: selectedType,
      title: blockData.title,
      content: blockData.content,
      mediaUrl: blockData.mediaUrl,
      order: blocks.length,
    });
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-content-blocks">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Blocks</h2>
          <p className="text-sm text-muted-foreground">
            Add rich media and interactive elements to your profile
          </p>
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="w-full h-12 text-base font-semibold gradient-shimmer hover-neon-glow" data-testid="button-add-content-block">
            <Plus className="w-5 h-5 mr-2" />
            Add Content Block
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Content Block</DialogTitle>
            <DialogDescription>
              Choose a content type and customize it for your profile
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Content Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {blockTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all hover-elevate ${
                      selectedType === type.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <type.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">{type.name}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block-title">Title (Optional)</Label>
              <Input
                id="block-title"
                placeholder="Content block title"
                value={blockData.title}
                onChange={(e) => setBlockData({ ...blockData, title: e.target.value })}
              />
            </div>

            {(selectedType === "video" || selectedType === "image") && (
              <div className="space-y-2">
                <Label htmlFor="media-url">
                  {selectedType === "video" ? "Video URL" : "Image URL"}
                </Label>
                <Input
                  id="media-url"
                  type="url"
                  placeholder={
                    selectedType === "video"
                      ? "https://youtube.com/watch?v=..."
                      : "https://example.com/image.jpg"
                  }
                  value={blockData.mediaUrl}
                  onChange={(e) => setBlockData({ ...blockData, mediaUrl: e.target.value })}
                />
              </div>
            )}

            {(selectedType === "text" || selectedType === "embed" || selectedType === "gallery") && (
              <div className="space-y-2">
                <Label htmlFor="content">
                  {selectedType === "text" ? "Text Content" : 
                   selectedType === "gallery" ? "Image URLs (one per line)" : "Embed Code"}
                </Label>
                <Textarea
                  id="content"
                  placeholder={
                    selectedType === "text"
                      ? "Write your content here..."
                      : selectedType === "gallery"
                      ? "https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                      : "<iframe src='...'></iframe>"
                  }
                  value={blockData.content}
                  onChange={(e) => setBlockData({ ...blockData, content: e.target.value })}
                  className="min-h-32"
                />
              </div>
            )}

            {selectedType === "form" && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  An email collection form will be created. You can view submissions in the
                  Analytics section.
                </p>
              </div>
            )}

            <Button
              onClick={handleAddBlock}
              disabled={createBlockMutation.isPending}
              className="w-full"
            >
              {createBlockMutation.isPending ? "Adding..." : "Add Block"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {blocks.length === 0 ? (
        <div className="text-center py-12 space-y-4 bg-gradient-to-b from-primary/5 to-transparent rounded-xl border-2 border-dashed">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-2xl flex items-center justify-center border border-primary/30">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">No content blocks yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add videos, images, text, and forms to make your profile stand out
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block) => {
            const BlockIcon = blockTypes.find(t => t.id === block.type)?.icon || FileText;
            return (
              <div
                key={block.id}
                className="group flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-card-border hover:border-primary/30 shadow-sm transition-all"
              >
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <BlockIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {block.title || blockTypes.find(t => t.id === block.type)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {blockTypes.find(t => t.id === block.type)?.description}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteBlockMutation.mutate(block.id)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
