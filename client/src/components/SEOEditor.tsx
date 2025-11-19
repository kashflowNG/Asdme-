import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Share2, Eye } from "lucide-react";
import type { Profile } from "@shared/schema";

interface SEOEditorProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

export function SEOEditor({ profile, onUpdate }: SEOEditorProps) {
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
            placeholder={`${profile.username} - Link Hub`}
            value={profile.seoTitle || ""}
            onChange={(e) => onUpdate({ seoTitle: e.target.value })}
            maxLength={60}
            data-testid="input-seo-title"
          />
          <p className="text-xs text-muted-foreground">
            {(profile.seoTitle || "").length}/60 characters. Shown in search results and browser tabs.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-description">Meta Description</Label>
          <Textarea
            id="seo-description"
            placeholder="Discover all my social media profiles and links in one place..."
            value={profile.seoDescription || ""}
            onChange={(e) => onUpdate({ seoDescription: e.target.value })}
            maxLength={160}
            className="min-h-20 resize-none"
            data-testid="textarea-seo-description"
          />
          <p className="text-xs text-muted-foreground">
            {(profile.seoDescription || "").length}/160 characters. Shown in search engine results.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="og-image">Social Share Image (OG Image)</Label>
          <Input
            id="og-image"
            type="url"
            placeholder="https://example.com/share-image.jpg"
            value={profile.ogImage || ""}
            onChange={(e) => onUpdate({ ogImage: e.target.value })}
            data-testid="input-og-image"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 1200x630px. This image appears when sharing on social media.
          </p>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="w-4 h-4" />
            Social Media Preview
          </div>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            {profile.ogImage && (
              <div
                className="w-full h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.ogImage})` }}
              />
            )}
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold line-clamp-1">
                {profile.seoTitle || `${profile.username} - Link Hub`}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {profile.seoDescription || profile.bio || "Discover all my social media profiles and links in one place."}
              </p>
              <p className="text-xs text-muted-foreground">{profileUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
