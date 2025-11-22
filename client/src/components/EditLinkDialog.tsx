import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPlatform } from "@/lib/platforms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "lucide-react";
import type { SocialLink } from "@shared/schema";

interface EditLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: SocialLink | null;
  onUpdate: (updates: Partial<SocialLink>) => void;
}

export function EditLinkDialog({ open, onOpenChange, link, onUpdate }: EditLinkDialogProps) {
  const [formData, setFormData] = useState({
    url: "",
    customTitle: "",
    badge: "none",
    description: "",
    isScheduled: false,
    scheduleStart: "",
    scheduleEnd: "",
  });

  useEffect(() => {
    if (link) {
      setFormData({
        url: link.url || "",
        customTitle: link.customTitle || "",
        badge: link.badge || "none",
        description: link.description || "",
        isScheduled: typeof link.isScheduled === 'number' ? link.isScheduled === 1 : link.isScheduled || false,
        scheduleStart: link.scheduleStart || "",
        scheduleEnd: link.scheduleEnd || "",
      });
    }
  }, [link]);

  const handleUpdate = () => {
    if (formData.url) {
      onUpdate({
        url: formData.url,
        customTitle: formData.customTitle || undefined,
        badge: formData.badge === "none" ? undefined : formData.badge,
        description: formData.description || undefined,
        isScheduled: formData.isScheduled,
        scheduleStart: formData.scheduleStart || undefined,
        scheduleEnd: formData.scheduleEnd || undefined,
      });
    }
  };

  if (!link) return null;

  const platform = getPlatform(link.platform);
  if (!platform) return null;

  const Icon = platform.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Link</DialogTitle>
          <DialogDescription>
            Update your {platform.name} link details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
            <div className="p-3 bg-background rounded-lg shadow-sm">
              <Icon
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
            <div className="space-y-2">
              <Label htmlFor="url">Link URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder={platform.placeholder}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                data-testid="input-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customTitle">Custom Title (Optional)</Label>
              <Input
                id="customTitle"
                type="text"
                placeholder={`Custom name for ${platform.name}`}
                value={formData.customTitle}
                onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                data-testid="input-custom-title"
              />
              <p className="text-xs text-muted-foreground">
                Override the default platform name with your own title
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for this link..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-20 resize-none"
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge">Badge (Optional)</Label>
              <Select
                value={formData.badge}
                onValueChange={(value) => setFormData({ ...formData, badge: value })}
              >
                <SelectTrigger data-testid="select-badge">
                  <SelectValue placeholder="Select a badge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Badge</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="schedule">Schedule Link</Label>
                  <p className="text-xs text-muted-foreground">
                    Set time range when this link should be visible
                  </p>
                </div>
                <Switch
                  id="schedule"
                  checked={formData.isScheduled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isScheduled: checked })
                  }
                  data-testid="switch-schedule"
                />
              </div>

              {formData.isScheduled && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduleStart">Start Date & Time</Label>
                    <div className="relative">
                      <Input
                        id="scheduleStart"
                        type="datetime-local"
                        value={formData.scheduleStart}
                        onChange={(e) =>
                          setFormData({ ...formData, scheduleStart: e.target.value })
                        }
                        data-testid="input-schedule-start"
                      />
                      <Calendar className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduleEnd">End Date & Time</Label>
                    <div className="relative">
                      <Input
                        id="scheduleEnd"
                        type="datetime-local"
                        value={formData.scheduleEnd}
                        onChange={(e) =>
                          setFormData({ ...formData, scheduleEnd: e.target.value })
                        }
                        data-testid="input-schedule-end"
                      />
                      <Calendar className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!formData.url.trim()}
            data-testid="button-update"
            className="bg-primary hover:bg-primary/90"
          >
            Update Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
