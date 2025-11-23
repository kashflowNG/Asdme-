import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Eye, FileCode, Palette, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Profile } from "@shared/schema";

interface TemplateEditorProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const DEFAULT_TEMPLATE_HTML = `<div class="profile-container">
  <div class="profile-header">
    <img src="{{avatar}}" alt="{{username}}" class="profile-avatar" />
    <h1 class="profile-username">@{{username}}</h1>
    <p class="profile-bio">{{bio}}</p>
  </div>
  
  <div class="content-blocks">
    {{contentBlocks}}
  </div>
  
  <div class="social-links">
    {{socialLinks}}
  </div>
</div>`;

const DEFAULT_TEMPLATE_CSS = `.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.profile-avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  margin-bottom: 1rem;
  border: 4px solid var(--primary-color, #8B5CF6);
}

.profile-username {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--primary-color, #8B5CF6), var(--background-color, #0A0A0F));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.profile-bio {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-blocks {
  margin-bottom: 2rem;
}`;

export function TemplateEditor({ profile, onUpdate }: TemplateEditorProps) {
  const [templateHTML, setTemplateHTML] = useState(
    profile.templateHTML || DEFAULT_TEMPLATE_HTML
  );
  const [templateCSS, setTemplateCSS] = useState(
    profile.templateCSS || DEFAULT_TEMPLATE_CSS
  );
  const [useCustomTemplate, setUseCustomTemplate] = useState(
    profile.useCustomTemplate || false
  );

  const handleSave = () => {
    onUpdate({
      templateHTML,
      templateCSS,
      useCustomTemplate,
    });
  };

  const handleReset = () => {
    setTemplateHTML(DEFAULT_TEMPLATE_HTML);
    setTemplateCSS(DEFAULT_TEMPLATE_CSS);
  };

  const handleToggleCustomTemplate = (checked: boolean) => {
    setUseCustomTemplate(checked);
    onUpdate({
      useCustomTemplate: checked,
    });
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-template-editor">
      <div className="flex items-center gap-3">
        <FileCode className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Custom Template Editor</h2>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Advanced feature: Edit the HTML and CSS template used to render your profile.
          Use placeholders like <code className="bg-muted px-1 py-0.5 rounded">{"{{username}}"}</code>, 
          <code className="bg-muted px-1 py-0.5 rounded mx-1">{"{{bio}}"}</code>, 
          <code className="bg-muted px-1 py-0.5 rounded mx-1">{"{{avatar}}"}</code>, 
          <code className="bg-muted px-1 py-0.5 rounded mx-1">{"{{socialLinks}}"}</code>, and 
          <code className="bg-muted px-1 py-0.5 rounded">{"{{contentBlocks}}"}</code>.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-primary" />
          <div>
            <Label htmlFor="use-custom-template" className="text-base font-semibold">
              Use Custom Template
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable to use your custom HTML/CSS instead of the default theme
            </p>
          </div>
        </div>
        <Switch
          id="use-custom-template"
          checked={useCustomTemplate}
          onCheckedChange={handleToggleCustomTemplate}
          data-testid="switch-use-custom-template"
        />
      </div>

      <Tabs defaultValue="html" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="html" className="gap-2">
            <Code className="w-4 h-4" />
            HTML Template
          </TabsTrigger>
          <TabsTrigger value="css" className="gap-2">
            <Palette className="w-4 h-4" />
            CSS Styles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="html" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="template-html" className="text-base font-semibold">
              HTML Template
            </Label>
            <Textarea
              id="template-html"
              placeholder={DEFAULT_TEMPLATE_HTML}
              value={templateHTML}
              onChange={(e) => setTemplateHTML(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              data-testid="textarea-template-html"
            />
            <p className="text-xs text-muted-foreground">
              Available placeholders: {"{{username}}"}, {"{{bio}}"}, {"{{avatar}}"}, {"{{socialLinks}}"}, {"{{contentBlocks}}"}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="css" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="template-css" className="text-base font-semibold">
              CSS Styles
            </Label>
            <Textarea
              id="template-css"
              placeholder={DEFAULT_TEMPLATE_CSS}
              value={templateCSS}
              onChange={(e) => setTemplateCSS(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              data-testid="textarea-template-css"
            />
            <p className="text-xs text-muted-foreground">
              CSS variables available: --primary-color, --background-color, --foreground
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          className="flex-1"
          data-testid="button-save-template"
        >
          Save Template
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          data-testid="button-reset-template"
        >
          Reset to Default
        </Button>
      </div>
    </Card>
  );
}
