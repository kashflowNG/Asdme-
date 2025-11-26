import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye } from "lucide-react";
import type { Profile } from "@shared/schema";
import { useState, useEffect, useCallback, useRef } from "react";

interface SEOEditorProps {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => void;
}

export function SEOEditor({ profile, onUpdate }: SEOEditorProps) {
  const [localSeoTitle, setLocalSeoTitle] = useState(profile?.seoTitle || "");
  const [localSeoDescription, setLocalSeoDescription] = useState(profile?.seoDescription || "");
  const [localOgImage, setLocalOgImage] = useState(profile?.ogImage || "");
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (profile) {
      setLocalSeoTitle(profile.seoTitle || "");
      setLocalSeoDescription(profile.seoDescription || "");
      setLocalOgImage(profile.ogImage || "");
    }
  }, [profile?.id]);

  const debouncedUpdate = useCallback((updates: Partial<Profile>) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onUpdate(updates);
    }, 500);
  }, [onUpdate]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSeoTitleChange = (value: string) => {
    setLocalSeoTitle(value);
    debouncedUpdate({ seoTitle: value });
  };

  const handleSeoDescriptionChange = (value: string) => {
    setLocalSeoDescription(value);
    debouncedUpdate({ seoDescription: value });
  };

  const handleOgImageChange = (value: string) => {
    setLocalOgImage(value);
    debouncedUpdate({ ogImage: value });
  };

  if (!profile) {
    return null;
  }

  const profileUrl = `${window.location.origin}/user/${profile.username}`;

  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-seo-editor">
      <div className="flex items-center gap-3">
        <Search className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">SEO & Social Sharing</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seo-title">Page Title</Label>
          <Input
            id="seo-title"
            type="text"
            placeholder={`${profile.username} - All My Links | Neropage`}
            value={localSeoTitle}
            onChange={(e) => handleSeoTitleChange(e.target.value)}
            maxLength={60}
            data-testid="input-seo-title"
          />
          <p className="text-xs text-muted-foreground">
            {localSeoTitle.length}/60 characters. Optimize for search engines - include your name and key descriptors.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-description">Meta Description</Label>
          <Textarea
            id="seo-description"
            placeholder="Connect with me across all platforms. Find my latest content, social profiles, and ways to get in touch - all in one place."
            value={localSeoDescription}
            onChange={(e) => handleSeoDescriptionChange(e.target.value)}
            maxLength={160}
            className="min-h-20 resize-none"
            data-testid="textarea-seo-description"
          />
          <p className="text-xs text-muted-foreground">
            {localSeoDescription.length}/160 characters. Shown in search engine results.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="og-image">Social Share Image (OG Image)</Label>
          <Input
            id="og-image"
            type="url"
            placeholder="https://example.com/share-image.jpg"
            value={localOgImage}
            onChange={(e) => handleOgImageChange(e.target.value)}
            data-testid="input-og-image"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 1200x630px (2:1 ratio). This image appears when your profile is shared on social media. If empty, your avatar will be used.
          </p>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="w-4 h-4" />
            Social Media Preview
          </div>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            {localOgImage && (
              <div
                className="w-full h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${localOgImage})` }}
              />
            )}
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold line-clamp-1">
                {localSeoTitle || `${profile.username} - Link Hub`}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {localSeoDescription || profile.bio || "Discover all my social media profiles and links in one place."}
              </p>
              <p className="text-xs text-muted-foreground">{profileUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
