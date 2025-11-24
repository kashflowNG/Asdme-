import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Code, Eye, FileCode, AlertCircle, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Profile } from "@shared/schema";

interface TemplateEditorProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

const DEFAULT_TEMPLATE_HTML = `<div class="profile-container">
  <div class="profile-header">
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

export function TemplateEditor({ profile, onUpdate }: TemplateEditorProps) {
  const [templateHTML, setTemplateHTML] = useState(
    profile.templateHTML || DEFAULT_TEMPLATE_HTML
  );
  const [useCustomTemplate, setUseCustomTemplate] = useState(
    profile.useCustomTemplate || false
  );

  const handleSave = () => {
    onUpdate({
      templateHTML,
      useCustomTemplate,
    });
  };

  const handleReset = () => {
    setTemplateHTML(DEFAULT_TEMPLATE_HTML);
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
        <h2 className="text-2xl font-bold">Custom HTML Template</h2>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Advanced feature: Edit the HTML template used to render your profile. Use placeholders like{" "}
          <code className="bg-muted px-1 py-0.5 rounded">{"{{username}}"}</code>,{" "}
          <code className="bg-muted px-1 py-0.5 rounded">{"{{bio}}"}</code>,{" "}
          <code className="bg-muted px-1 py-0.5 rounded">{"{{socialLinks}}"}</code>, and{" "}
          <code className="bg-muted px-1 py-0.5 rounded">{"{{contentBlocks}}"}</code>.
          <br />
          <strong className="text-yellow-500">Note:</strong> Custom CSS is disabled for security. Use the Appearance tab for styling.
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
              Enable to use your custom HTML instead of the default theme
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

      <div className="space-y-3">
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
            Available placeholders: {"{{username}}"}, {"{{bio}}"}, {"{{socialLinks}}"}, {"{{contentBlocks}}"}
          </p>
        </div>
      </div>

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
