import { useState } from "react";
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
import { Palette, Image, Video, Code, Type, Layout, Sparkles } from "lucide-react";
import type { Profile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { VideoTrimmer } from "./VideoTrimmer";

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
  const { toast } = useToast(); // Initialize toast
  const [backgroundType, setBackgroundType] = useState<string>(
    profile.backgroundType || "color"
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
        backgroundImage: undefined,
        backgroundVideo: undefined,
        layout: "stacked",
        fontFamily: "DM Sans",
        buttonStyle: "rounded",
        customCSS: undefined,
        useCustomTemplate: false,
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="background" className="gap-2">
            <Image className="w-4 h-4" />
            Background
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2">
            <Type className="w-4 h-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Code className="w-4 h-4" />
            Custom
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

        <TabsContent value="background" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Background Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "color", name: "Solid Color", icon: Palette },
                { id: "gradient", name: "Gradient", icon: Palette },
                { id: "image", name: "Image", icon: Image },
                { id: "video", name: "Video", icon: Video },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleBackgroundTypeChange(type.id)}
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

          {backgroundType === "image" && (
            <div className="space-y-2">
              <Label htmlFor="bg-image">Background Image URL</Label>
              <Input
                id="bg-image"
                type="url"
                placeholder="https://example.com/background.jpg"
                value={profile.backgroundImage || ""}
                onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
                data-testid="input-background-image"
              />
              <p className="text-xs text-muted-foreground">
                Use high-quality images (1920x1080 or larger) for best results
              </p>
            </div>
          )}

          {backgroundType === "video" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bg-video">Background Video URL or Upload</Label>
                <Input
                  id="bg-video"
                  type="url"
                  placeholder="https://example.com/background.mp4"
                  value={profile.backgroundVideo || ""}
                  onChange={(e) => onUpdate({ backgroundVideo: e.target.value })}
                  data-testid="input-background-video"
                />
                <p className="text-xs text-muted-foreground">
                  Paste a URL or upload below
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Upload & Trim Video</Label>
                <VideoTrimmer
                  initialUrl={profile.backgroundVideo}
                  onVideoTrimmed={(url) => {
                    onUpdate({ backgroundVideo: url });
                    toast({ title: "Success", description: "Background video updated!" });
                  }}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Layout Style</Label>
            <div className="grid gap-3">
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => onUpdate({ layout: layout.id })}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                    profile.layout === layout.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-layout-${layout.id}`}
                >
                  <p className="font-semibold">{layout.name}</p>
                  <p className="text-sm text-muted-foreground">{layout.description}</p>
                </button>
              ))}
            </div>
          </div>

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

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium mb-2">Preview</p>
            <div
              style={{
                fontFamily: profile.fontFamily || "DM Sans",
                color: profile.primaryColor || "#8B5CF6",
              }}
            >
              <h3 className="text-2xl font-bold mb-2">The Quick Brown Fox</h3>
              <p className="text-base">
                This is how your profile text will look with the selected font.
              </p>
            </div>
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