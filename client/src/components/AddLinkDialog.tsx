import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLATFORMS } from "@/lib/platforms";
import { Card } from "@/components/ui/card";

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (platform: string, url: string) => void;
  existingPlatforms: string[];
}

export function AddLinkDialog({ open, onOpenChange, onAdd, existingPlatforms }: AddLinkDialogProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  const handleAdd = () => {
    if (selectedPlatform && url.trim()) {
      onAdd(selectedPlatform, url.trim());
      setSelectedPlatform(null);
      setUrl("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedPlatform(null);
    setUrl("");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Social Link</DialogTitle>
        </DialogHeader>

        {!selectedPlatform ? (
          <div className="space-y-4">
            <Label>Choose a platform</Label>
            <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {availablePlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Card
                    key={platform.id}
                    className="aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover-elevate active-elevate-2 p-4"
                    onClick={() => setSelectedPlatform(platform.id)}
                    data-testid={`platform-${platform.id}`}
                  >
                    <Icon className="w-8 h-8" style={{ color: platform.color }} />
                    <span className="text-xs font-medium text-center">{platform.name}</span>
                  </Card>
                );
              })}
            </div>
            {availablePlatforms.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                All available platforms have been added
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              {selectedPlatformData && (
                <>
                  <selectedPlatformData.icon
                    className="w-6 h-6"
                    style={{ color: selectedPlatformData.color }}
                  />
                  <span className="font-medium">{selectedPlatformData.name}</span>
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Profile URL</Label>
              <Input
                id="url"
                type="url"
                placeholder={selectedPlatformData?.placeholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                data-testid="input-url"
              />
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
              Back
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
              disabled={!url.trim()}
              data-testid="button-add"
            >
              Add Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
