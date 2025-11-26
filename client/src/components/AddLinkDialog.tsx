import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLATFORMS, PLATFORM_CATEGORIES, getPlatformsByCategory } from "@/lib/platforms";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    platform: string,
    url: string,
    customTitle?: string,
    badge?: string,
    description?: string,
    isScheduled?: boolean,
    scheduleStart?: string,
    scheduleEnd?: string
  ) => void;
  existingPlatforms: string[];
}

export function AddLinkDialog({ open, onOpenChange, onAdd, existingPlatforms }: AddLinkDialogProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    customTitle: "",
    badge: "none",
    description: "",
    isScheduled: false,
    scheduleStart: "",
    scheduleEnd: "",
  });
  const [activeCategory, setActiveCategory] = useState<string>('social');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    if (formData.platform && formData.url) {
      addLinkMutation.mutate({
        platform: formData.platform,
        url: formData.url,
        customTitle: formData.customTitle || undefined,
        badge: formData.badge === "none" ? undefined : formData.badge,
        description: formData.description || undefined,
        isScheduled: formData.isScheduled,
        scheduleStart: formData.scheduleStart || undefined,
        scheduleEnd: formData.scheduleEnd || undefined,
        order: existingPlatforms.length,
      });
    }
  };

  const handleCancel = () => {
    setSelectedPlatform(null);
    setFormData({
      platform: "",
      url: "",
      customTitle: "",
      badge: "none",
      description: "",
      isScheduled: false,
      scheduleStart: "",
      scheduleEnd: "",
    });
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedPlatform(null);
    setFormData({
      platform: "",
      url: "",
      customTitle: "",
      badge: "none",
      description: "",
      isScheduled: false,
      scheduleStart: "",
      scheduleEnd: "",
    });
    onOpenChange(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const fullUrl = `${window.location.origin}${data.url}`;

      setFormData(prev => ({ ...prev, url: fullUrl }));
      toast({
        title: "Success",
        description: "Image uploaded and URL generated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addLinkMutation = useMutation({
    mutationFn: async (linkData: any) => {
      return apiRequest("POST", "/api/links", linkData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Success",
        description: "Link added successfully",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add link",
        variant: "destructive",
      });
    },
  });

  const availablePlatforms = PLATFORMS.filter(
    (p) => !existingPlatforms.includes(p.id)
  );

  const selectedPlatformData = selectedPlatform
    ? PLATFORMS.find((p) => p.id === selectedPlatform)
    : null;

  const platform = selectedPlatformData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Platform Link</DialogTitle>
          <DialogDescription>
            Connect your audience across 25+ platforms with LinkNero's unified presence manager
          </DialogDescription>
        </DialogHeader>

        {!selectedPlatform ? (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {PLATFORM_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                  <span className="mr-1">{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {PLATFORM_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {getPlatformsByCategory(category.id as any)
                      .filter((p) => !existingPlatforms.includes(p.id))
                      .map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <Card
                            key={platform.id}
                            className="aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover-elevate active-elevate-2 p-3 transition-all hover:shadow-lg"
                            onClick={() => {
                              setSelectedPlatform(platform.id);
                              setFormData({ ...formData, platform: platform.id });
                            }}
                            data-testid={`platform-${platform.id}`}
                          >
                            <Icon className="w-8 h-8" style={{ color: platform.color }} />
                            <span className="text-xs font-medium text-center leading-tight">{platform.name}</span>
                          </Card>
                        );
                      })}
                  </div>
                  {getPlatformsByCategory(category.id as any)
                    .filter((p) => !existingPlatforms.includes(p.id)).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      All {category.label.toLowerCase()} platforms have been added
                    </p>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {selectedPlatform && platform && (
                <>
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 mb-4">
                    <div className="p-3 bg-background rounded-lg shadow-sm">
                      <platform.icon
                        className="w-8 h-8"
                        style={{ color: platform.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">{platform.placeholder}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                  {selectedPlatform === 'custom' && (
                    <div className="space-y-3">
                      <Label htmlFor="customTitle" className="text-base font-semibold">Link Title</Label>
                      <Input
                        id="customTitle"
                        type="text"
                        placeholder="e.g., My Portfolio, My Blog, etc."
                        value={formData.customTitle}
                        onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                        autoFocus
                        className="h-12 text-base"
                        data-testid="input-custom-title"
                      />
                      <p className="text-xs text-muted-foreground">
                        Give your custom link a descriptive name
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Badge (Optional)</Label>
                    <Select value={formData.badge} onValueChange={(value) => setFormData({ ...formData, badge: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="No badge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No badge</SelectItem>
                        <SelectItem value="new">NEW</SelectItem>
                        <SelectItem value="hot">HOT</SelectItem>
                        <SelectItem value="popular">POPULAR</SelectItem>
                        <SelectItem value="limited">LIMITED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      type="text"
                      placeholder="Short description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="scheduled"
                      checked={formData.isScheduled}
                      onCheckedChange={(checked) => setFormData({ ...formData, isScheduled: checked })}
                    />
                    <Label htmlFor="scheduled" className="cursor-pointer">Schedule this link</Label>
                  </div>

                  {formData.isScheduled && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            value={formData.scheduleStart}
                            onChange={(e) => setFormData({ ...formData, scheduleStart: e.target.value })}
                            className="pr-8"
                          />
                          <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            value={formData.scheduleEnd}
                            onChange={(e) => setFormData({ ...formData, scheduleEnd: e.target.value })}
                            className="pr-8"
                          />
                          <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-semibold">
                      {selectedPlatform === 'custom' ? 'URL' : 'Profile URL'}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="url"
                        type="url"
                        placeholder={platform?.placeholder || "https://example.com"}
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="h-12 text-base flex-1"
                        data-testid="input-url"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-12 px-4"
                      >
                        {isUploading ? (
                          <Upload className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click the image icon to upload an image and auto-generate URL
                    </p>
                  </div>
                </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {selectedPlatform && (
            <Button
              variant="outline"
              onClick={() => setSelectedPlatform(null)}
              data-testid="button-back"
            >
              ← Back
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          {selectedPlatform && (
            <Button
              onClick={handleAdd}
              disabled={!formData.url.trim() || addLinkMutation.isPending}
              data-testid="button-add"
              className="bg-primary hover:bg-primary/90"
            >
              {addLinkMutation.isPending ? "Adding..." : "Add Link"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}