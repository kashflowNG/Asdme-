import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Image, Video, Code, Type, Layout, Sparkles, Link2, Zap } from "lucide-react";
import type { Profile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "./ImageUploader";
import { VideoUploader } from "./VideoUploader";
import { MediaManager } from "./MediaManager";
import { LayoutsGallery } from "./LayoutsGallery";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AppearanceEditorProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>; // Added for toast functionality
}

const themes = [
  { id: "neon", name: "Neo Neon", primaryColor: "#8B5CF6", backgroundColor: "#0A0A0F" },
  { id: "ocean", name: "Ocean Blue", primaryColor: "#06B6D4", backgroundColor: "#0C1222" },
  { id: "sunset", name: "Sunset Glow", primaryColor: "#F97316", backgroundColor: "#1A0F0A" },
  { id: "forest", name: "Forest Green", primaryColor: "#10B981", backgroundColor: "#0A1810" },
  { id: "royal", name: "Royal Purple", primaryColor: "#A855F7", backgroundColor: "#1A0F2E" },
  { id: "cherry", name: "Cherry Blossom", primaryColor: "#EC4899", backgroundColor: "#1F0A15" },
  { id: "minimal", name: "Minimal White", primaryColor: "#000000", backgroundColor: "#FFFFFF" },
  { id: "dark", name: "Dark Mode", primaryColor: "#3B82F6", backgroundColor: "#111827" },
];

const fonts = [
  "DM Sans",
  "Inter",
  "Poppins",
  "Roboto",
  "Montserrat",
  "Open Sans",
  "Lato",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Sora",
  "Work Sans",
  "Quicksand",
  "Karla",
  "Outfit",
  "Space Mono",
  "IBM Plex Sans",
  "Lexend",
  "JetBrains Mono",
  "Fira Sans",
  "Source Sans Pro",
  "Caveat",
  "Comfortaa",
  "Fredoka",
  "Overpass",
  "Titillium Web",
  "Varela Round",
];

const buttonStyles = [
  { id: "rounded", name: "Rounded" },
  { id: "square", name: "Square" },
  { id: "pill", name: "Pill" },
];

const layouts = [
  { id: "stacked", name: "Stacked", description: "Single column, traditional layout" },
  { id: "grid", name: "Grid", description: "Multi-column grid layout" },
  { id: "minimal", name: "Minimal", description: "Clean, centered minimal design" },
];

export function AppearanceEditor({ profile, onUpdate, updateProfile }: AppearanceEditorProps) {
  const { toast } = useToast();
  const [backgroundType, setBackgroundType] = useState<string>(
    profile.backgroundType || "color"
  );

  const { data: shopItems = [] } = useQuery<any[]>({
    queryKey: ["/api/shop/items"],
  });

  const purchasedStyles = shopItems.filter(
    (item: any) => item.type === "style" && item.isPurchased
  );

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      onUpdate({
        theme: theme.id,
        primaryColor: theme.primaryColor,
        backgroundColor: theme.backgroundColor,
      });
    }
  };

  const handleBackgroundTypeChange = (type: string) => {
    setBackgroundType(type);
    onUpdate({ backgroundType: type });
  };

  const handleColorChange = async (field: 'primaryColor' | 'backgroundColor', color: string) => {
    try {
      await updateProfile({ [field]: color });
      toast({
        title: "Color updated",
        description: "Your profile color has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update color",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResetToDefaults = async () => {
    try {
      await updateProfile({
        theme: "neon",
        primaryColor: "#8B5CF6",
        backgroundColor: "#0A0A0F",
        backgroundType: "color",
        backgroundImage: "",
        backgroundVideo: "",
        layout: "stacked",
        fontFamily: "DM Sans",
        textColor: "#E5E7EB",
        buttonStyle: "rounded",
        customCSS: "",
      });
      toast({
        title: "Reset to defaults",
        description: "Your appearance settings have been reset to defaults",
      });
    } catch (error: any) {
      toast({
        title: "Failed to reset",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-appearance-editor">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Appearance Customization</h2>
      </div>

      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
          <TabsTrigger value="theme" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Palette className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Theme</span>
            <span className="sm:hidden">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="background" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Image className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Background</span>
            <span className="sm:hidden">BG</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Layout className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Layout</span>
            <span className="sm:hidden">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Type className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Typography</span>
            <span className="sm:hidden">Type</span>
          </TabsTrigger>
          <TabsTrigger value="styles" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Styles</span>
            <span className="sm:hidden">Style</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Code className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Custom</span>
            <span className="sm:hidden">CSS</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Choose a Theme</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`p-4 rounded-lg border-2 transition-all hover-elevate ${
                    profile.theme === theme.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-theme-${theme.id}`}
                >
                  <div
                    className="w-full h-12 rounded-md mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.primaryColor})`,
                    }}
                  />
                  <p className="text-sm font-medium">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={profile.primaryColor || "#8B5CF6"}
                  onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                  className="w-20 h-10"
                  data-testid="input-primary-color"
                />
                <Input
                  type="text"
                  value={profile.primaryColor || "#8B5CF6"}
                  onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                  className="flex-1"
                  placeholder="#8B5CF6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={profile.backgroundColor || "#0A0A0F"}
                  onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                  className="w-20 h-10"
                  data-testid="input-background-color"
                />
                <Input
                  type="text"
                  value={profile.backgroundColor || "#0A0A0F"}
                  onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                  className="flex-1"
                  placeholder="#0A0A0F"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="background" className="space-y-6">
          {/* Cover Photo - Simple Section */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Image className="w-4 h-4" />
              Cover Photo (Optional)
            </Label>
            <p className="text-xs text-muted-foreground">Displays as the hero background on your profile</p>
            <Input
              type="url"
              placeholder="https://example.com/cover.jpg"
              value={profile.coverPhoto || ""}
              onChange={(e) => onUpdate({ coverPhoto: e.target.value })}
              className="text-sm"
            />
          </div>

          {/* Background Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Choose Background Style</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "color", name: "Solid", icon: Palette, desc: "Single color" },
                { id: "gradient", name: "Gradient", icon: Palette, desc: "CSS gradient" },
                { id: "image", name: "Image", icon: Image, desc: "Static image" },
                { id: "video", name: "Video", icon: Video, desc: "Video loop" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleBackgroundTypeChange(type.id)}
                  title={type.desc}
                  className={`p-3 rounded-lg border-2 transition-all hover-elevate ${
                    backgroundType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-bg-type-${type.id}`}
                >
                  <type.icon className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-medium">{type.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Solid Color Section */}
          {backgroundType === "color" && (
            <div className="space-y-3 p-4 rounded-lg bg-primary/5 border-2 border-primary/30">
              <Label htmlFor="bg-solid-color" className="text-sm font-semibold">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-solid-color"
                  type="color"
                  value={profile.backgroundColor || "#0A0A0F"}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={profile.backgroundColor || "#0A0A0F"}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                  className="flex-1 font-mono text-sm"
                  placeholder="#0A0A0F"
                />
              </div>
              <p className="text-xs text-muted-foreground">Click the color box or enter a hex color code</p>
            </div>
          )}

          {/* Gradient Section */}
          {backgroundType === "gradient" && (
            <div className="space-y-3 p-4 rounded-lg bg-primary/5 border-2 border-primary/30">
              <Label className="text-sm font-semibold">Gradient Background</Label>
              <div className="w-full h-24 rounded-lg border-2 border-primary/30 bg-black shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #EC4899, #06B6D4)"
                }}
              />
              <p className="text-xs text-muted-foreground">Go to the Custom CSS tab to create a custom gradient using CSS syntax</p>
            </div>
          )}

          {/* Image Upload Section */}
          {backgroundType === "image" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/30">
                <h3 className="font-semibold text-sm mb-3">Upload Background Image</h3>
                <ImageUploader
                  onImageUploaded={(url) => {
                    onUpdate({ backgroundImage: url });
                    toast({ title: "Success", description: "Background image updated!" });
                  }}
                  initialUrl={profile.backgroundImage || undefined}
                  maxSize={100}
                />
              </div>

              {/* OR URL Input */}
              <div className="space-y-2 p-4 rounded-lg border-2 border-dashed border-primary/30">
                <Label htmlFor="bg-image" className="flex items-center gap-2 font-semibold text-sm">
                  <Link2 className="w-4 h-4" />
                  Or Paste Image URL
                </Label>
                <Input
                  id="bg-image"
                  type="url"
                  placeholder="https://example.com/background.jpg"
                  value={profile.backgroundImage || ""}
                  onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
                  data-testid="input-background-image"
                />
                <p className="text-xs text-muted-foreground">PNG, JPG, or WebP (recommended 1920x1080+)</p>
              </div>

              {/* Previous Uploads */}
              <MediaManager />
            </div>
          )}

          {/* Video Upload Section */}
          {backgroundType === "video" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/30">
                <h3 className="font-semibold text-sm mb-3">Upload Background Video</h3>
                <VideoUploader
                  onVideoUploaded={(url) => {
                    onUpdate({ backgroundVideo: url });
                    toast({ title: "Success", description: "Background video updated!" });
                  }}
                  initialUrl={profile.backgroundVideo || undefined}
                  maxSize={500}
                />
              </div>

              {/* OR URL Input */}
              <div className="space-y-2 p-4 rounded-lg border-2 border-dashed border-primary/30">
                <Label htmlFor="bg-video" className="flex items-center gap-2 font-semibold text-sm">
                  <Link2 className="w-4 h-4" />
                  Or Paste Video URL
                </Label>
                <Input
                  id="bg-video"
                  type="url"
                  placeholder="https://example.com/background.mp4"
                  value={(profile.backgroundVideo as string | undefined) || ""}
                  onChange={(e) => onUpdate({ backgroundVideo: e.target.value })}
                  data-testid="input-background-video"
                />
                <p className="text-xs text-muted-foreground">MP4 format recommended (video will loop)</p>
              </div>

              {/* Previous Uploads */}
              <MediaManager />
            </div>
          )}
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <LayoutsGallery 
            selectedLayout={profile.layout || "stacked"}
            onSelectLayout={(layoutId) => onUpdate({ layout: layoutId })}
          />

          <div className="space-y-3">
            <Label className="text-base font-semibold">Button Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {buttonStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onUpdate({ buttonStyle: style.id })}
                  className={`p-3 rounded-lg border-2 transition-all hover-elevate ${
                    profile.buttonStyle === style.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-style-${style.id}`}
                >
                  <p className="text-sm font-medium">{style.name}</p>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="font-family" className="text-base font-semibold">
              Font Family
            </Label>
            <Select
              value={profile.fontFamily || "DM Sans"}
              onValueChange={(value) => onUpdate({ fontFamily: value })}
            >
              <SelectTrigger id="font-family" data-testid="select-font-family">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="text-color" className="text-base font-semibold">
              Text Color
            </Label>
            <div className="flex gap-3">
              <input
                id="text-color"
                type="color"
                value={profile.textColor || "#E5E7EB"}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="w-20 h-12 rounded-lg border-2 border-border cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Selected Color</p>
                <Input
                  type="text"
                  value={profile.textColor || "#E5E7EB"}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                  placeholder="#E5E7EB"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium mb-2">Preview</p>
            <div
              style={{
                fontFamily: profile.fontFamily || "DM Sans",
                color: profile.textColor || "#E5E7EB",
              }}
            >
              <h3 className="text-2xl font-bold mb-2">The Quick Brown Fox</h3>
              <p className="text-base">
                This is how your profile text will look with the selected font and color.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="styles" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Purchased Styles</Label>
            {purchasedStyles.length === 0 ? (
              <div className="p-6 bg-muted/30 rounded-lg text-center">
                <Zap className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-3">You haven't purchased any styles yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {purchasedStyles.map((style: any) => (
                  <div
                    key={style.id}
                    className="p-4 rounded-lg border-2 border-muted-foreground/20 hover:border-primary/50 cursor-pointer transition-all"
                    onClick={() => {
                      onUpdate({ customCSS: style.css || "" });
                      toast({
                        title: "Style applied!",
                        description: `${style.name} has been applied to your profile`,
                      });
                    }}
                  >
                    <h4 className="font-semibold mb-1">{style.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{style.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Apply Style
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-css" className="text-base font-semibold">
                Custom CSS
              </Label>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                Advanced
              </span>
            </div>
            <Textarea
              id="custom-css"
              placeholder="/* Add your custom CSS here */&#10;.profile-link {&#10;  border-radius: 20px;&#10;  box-shadow: 0 4px 12px rgba(0,0,0,0.1);&#10;}"
              value={profile.customCSS || ""}
              onChange={(e) => onUpdate({ customCSS: e.target.value })}
              className="min-h-48 font-mono text-sm"
              data-testid="textarea-custom-css"
            />
            <p className="text-xs text-muted-foreground">
              Advanced users can add custom CSS to further personalize their profile
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleResetToDefaults}
        >
          Reset to Default
        </Button>
        <Button className="flex-1 gradient-shimmer hover-neon-glow">
          Save Appearance
        </Button>
      </div>
    </Card>
  );
}