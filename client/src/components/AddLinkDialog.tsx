import { useState } from "react";
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
import { Calendar } from "lucide-react";

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
    badge: "",
    description: "",
    isScheduled: false,
    scheduleStart: "",
    scheduleEnd: "",
  });
  const [activeCategory, setActiveCategory] = useState<string>('social');

  const handleAdd = () => {
    if (formData.platform && formData.url) {
      onAdd(
        formData.platform,
        formData.url,
        formData.customTitle || undefined,
        formData.badge || undefined,
        formData.description || undefined,
        formData.isScheduled,
        formData.scheduleStart || undefined,
        formData.scheduleEnd || undefined
      );
      setFormData({
        platform: "",
        url: "",
        customTitle: "",
        badge: "",
        description: "",
        isScheduled: false,
        scheduleStart: "",
        scheduleEnd: "",
      });
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedPlatform(null);
    setFormData({
      platform: "",
      url: "",
      customTitle: "",
      badge: "",
      description: "",
      isScheduled: false,
      scheduleStart: "",
      scheduleEnd: "",
    });
    onOpenChange(false);
  };

  const availablePlatforms = PLATFORMS.filter(
    (p) => !existingPlatforms.includes(p.id)
  );

  const selectedPlatformData = selectedPlatform
    ? PLATFORMS.find((p) => p.id === selectedPlatform)
    : null;

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
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
              {selectedPlatformData && (
                <>
                  <div className="p-3 bg-background rounded-lg shadow-sm">
                    <selectedPlatformData.icon
                      className="w-8 h-8"
                      style={{ color: selectedPlatformData.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{selectedPlatformData.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{selectedPlatformData.category}</p>
                  </div>
                </>
              )}
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
                    <SelectItem value="">No badge</SelectItem>
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

              <div className="space-y-3">
                <Label htmlFor="url" className="text-base font-semibold">
                  {selectedPlatform === 'custom' ? 'URL' : 'Profile URL'}
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder={selectedPlatformData?.placeholder}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  autoFocus={selectedPlatform !== 'custom'}
                  className="h-12 text-base"
                  data-testid="input-url"
                />
                <p className="text-xs text-muted-foreground">
                  {selectedPlatform === 'custom'
                    ? 'Enter the complete URL for this link'
                    : 'Enter the complete URL to your profile on this platform'
                  }
                </p>
              </div>
            </div>
          </div>
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
              disabled={!formData.url.trim()}
              data-testid="button-add"
              className="bg-primary hover:bg-primary/90"
            >
              Add Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}