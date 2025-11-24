import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Eye, FileCode, Shield, Sparkles, Info, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@shared/schema";
import DOMPurify from "dompurify";

interface TemplateEditorProps {
  profile: Profile;
  onUpdate: (updates: any) => void;
}

const DEFAULT_TEMPLATE_HTML = `<div class="profile-container">
  <div class="profile-header">
    <h1 class="profile-username">@{{username}}</h1>
    <p class="profile-bio">{{bio}}</p>
    {{#if avatar}}
    <div class="profile-avatar-wrapper">
      <img src="{{avatar}}" alt="{{username}}" class="profile-avatar" />
    </div>
    {{/if}}
  </div>
  
  <div class="content-blocks">
    {{contentBlocks}}
  </div>
  
  <div class="social-links">
    {{socialLinks}}
  </div>
</div>`;

const TEMPLATE_PRESETS = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple layout',
    template: `<div class="profile-minimal">
  <h1>@{{username}}</h1>
  <p>{{bio}}</p>
  <div class="links">{{socialLinks}}</div>
</div>`
  },
  {
    id: 'centered',
    name: 'Centered',
    description: 'Center-aligned professional layout',
    template: `<div class="profile-centered">
  <div class="header-section">
    {{#if avatar}}<img src="{{avatar}}" alt="{{username}}" class="avatar-lg" />{{/if}}
    <h1>{{username}}</h1>
    <p class="bio-text">{{bio}}</p>
  </div>
  
  <div class="content-section">
    {{contentBlocks}}
  </div>
  
  <div class="links-section">
    {{socialLinks}}
  </div>
</div>`
  },
  {
    id: 'grid',
    name: 'Grid Layout',
    description: 'Modern grid-based design',
    template: `<div class="profile-grid">
  <header class="grid-header">
    <div class="user-info">
      {{#if avatar}}<img src="{{avatar}}" alt="{{username}}" />{{/if}}
      <h1>@{{username}}</h1>
      <p>{{bio}}</p>
    </div>
  </header>
  
  <section class="grid-content">
    {{contentBlocks}}
  </section>
  
  <aside class="grid-sidebar">
    {{socialLinks}}
  </aside>
</div>`
  },
  {
    id: 'card',
    name: 'Card Style',
    description: 'Card-based layout with sections',
    template: `<div class="profile-cards">
  <div class="card profile-card">
    {{#if avatar}}<img src="{{avatar}}" alt="{{username}}" class="card-avatar" />{{/if}}
    <h2>{{username}}</h2>
    <p>{{bio}}</p>
  </div>
  
  <div class="card content-card">
    <h3>Content</h3>
    {{contentBlocks}}
  </div>
  
  <div class="card links-card">
    <h3>Connect</h3>
    {{socialLinks}}
  </div>
</div>`
  }
];

const AVAILABLE_PLACEHOLDERS = [
  { name: '{{username}}', description: 'User\'s username' },
  { name: '{{bio}}', description: 'User\'s bio text' },
  { name: '{{avatar}}', description: 'User\'s avatar image URL' },
  { name: '{{socialLinks}}', description: 'Rendered social links' },
  { name: '{{contentBlocks}}', description: 'Rendered content blocks' },
  { name: '{{#if avatar}}...{{/if}}', description: 'Conditional: show only if avatar exists' },
  { name: '{{#if bio}}...{{/if}}', description: 'Conditional: show only if bio exists' },
];

export function TemplateEditor({ profile, onUpdate }: TemplateEditorProps) {
  const [templateHTML, setTemplateHTML] = useState(
    profile.templateHTML || DEFAULT_TEMPLATE_HTML
  );
  const [useCustomTemplate, setUseCustomTemplate] = useState(
    Boolean(profile.useCustomTemplate)
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const templateStats = useMemo(() => {
    const lines = templateHTML.split('\n').length;
    const chars = templateHTML.length;
    const placeholders = AVAILABLE_PLACEHOLDERS.filter(p => 
      templateHTML.includes(p.name.split('...')[0])
    ).length;
    
    return { lines, chars, placeholders };
  }, [templateHTML]);

  const previewHTML = useMemo(() => {
    if (!showPreview) return '';
    
    let preview = templateHTML;
    preview = preview.replace(/\{\{username\}\}/g, profile.username || 'YourUsername');
    preview = preview.replace(/\{\{bio\}\}/g, profile.bio || 'Your bio will appear here...');
    preview = preview.replace(/\{\{avatar\}\}/g, profile.avatar || '');
    preview = preview.replace(/\{\{#if avatar\}\}([\s\S]*?)\{\{\/if\}\}/g, profile.avatar ? '$1' : '');
    preview = preview.replace(/\{\{#if bio\}\}([\s\S]*?)\{\{\/if\}\}/g, profile.bio ? '$1' : '');
    preview = preview.replace(/\{\{socialLinks\}\}/g, '<div class="preview-placeholder">Social Links</div>');
    preview = preview.replace(/\{\{contentBlocks\}\}/g, '<div class="preview-placeholder">Content Blocks</div>');
    
    return DOMPurify.sanitize(preview, {
      ALLOWED_TAGS: ['div', 'h1', 'h2', 'h3', 'h4', 'p', 'span', 'img', 'section', 'header', 'aside', 'article'],
      ALLOWED_ATTR: ['class', 'src', 'alt']
    });
  }, [templateHTML, profile, showPreview]);

  const handleSave = () => {
    onUpdate({
      templateHTML,
      useCustomTemplate: useCustomTemplate ? 1 : 0,
    });
  };

  const handleReset = () => {
    setTemplateHTML(DEFAULT_TEMPLATE_HTML);
  };

  const handleToggleCustomTemplate = (checked: boolean) => {
    setUseCustomTemplate(checked);
    onUpdate({
      templateHTML,
      useCustomTemplate: checked ? 1 : 0,
    });
  };

  const handleCopyPlaceholder = (placeholder: string) => {
    navigator.clipboard.writeText(placeholder);
    setCopied(placeholder);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLoadPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setTemplateHTML(preset.template);
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-template-editor">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Custom HTML Template</h2>
            <p className="text-sm text-muted-foreground">Advanced HTML customization for your profile</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Code className="w-3 h-3" />
            {templateStats.lines} lines
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="w-3 h-3" />
            {templateStats.placeholders} placeholders
          </Badge>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Advanced Feature:</strong> Create custom HTML templates with dynamic placeholders.
          All HTML is sanitized for security. Use the Appearance tab for styling.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-primary" />
          <div>
            <Label htmlFor="use-custom-template" className="text-base font-semibold">
              Enable Custom Template
            </Label>
            <p className="text-xs text-muted-foreground">
              Use your custom HTML instead of the default theme
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

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="gap-2">
            <Code className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="placeholders" className="gap-2">
            <Info className="w-4 h-4" />
            Placeholders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="template-html" className="text-base font-semibold">
                HTML Template Code
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
                data-testid="button-toggle-preview"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
            
            <Textarea
              id="template-html"
              placeholder={DEFAULT_TEMPLATE_HTML}
              value={templateHTML}
              onChange={(e) => setTemplateHTML(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
              data-testid="textarea-template-html"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{templateStats.chars} characters</span>
              <span>{templateStats.lines} lines</span>
            </div>
          </div>

          {showPreview && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Live Preview</Label>
              <Card className="p-6 min-h-[200px] bg-muted/30">
                <div 
                  className="preview-content"
                  dangerouslySetInnerHTML={{ __html: previewHTML }}
                  data-testid="preview-content"
                />
              </Card>
              <p className="text-xs text-muted-foreground">
                Preview shows how your template will render with current profile data
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Choose a preset template to get started quickly
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATE_PRESETS.map((preset) => (
                <Card 
                  key={preset.id} 
                  className="p-4 hover-elevate cursor-pointer transition-all"
                  onClick={() => handleLoadPreset(preset)}
                  data-testid={`preset-${preset.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{preset.name}</h3>
                      <Badge variant="secondary">Load</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {preset.description}
                    </p>
                    <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                      {preset.template.slice(0, 100)}...
                    </pre>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="placeholders" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Available placeholders for dynamic content
              </p>
            </div>

            <div className="grid gap-3">
              {AVAILABLE_PLACEHOLDERS.map((placeholder) => (
                <Card 
                  key={placeholder.name} 
                  className="p-4 hover-elevate"
                  data-testid={`placeholder-${placeholder.name}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {placeholder.name}
                      </code>
                      <p className="text-sm text-muted-foreground">
                        {placeholder.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyPlaceholder(placeholder.name)}
                      className="flex-shrink-0 gap-2"
                      data-testid={`copy-placeholder-${placeholder.name}`}
                    >
                      {copied === placeholder.name ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
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
