
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Eye, FileCode, AlertCircle, Shield, Sparkles, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

const TEMPLATE_VARIABLES = [
  { name: '{{username}}', description: 'User\'s username', example: '@johndoe' },
  { name: '{{bio}}', description: 'User\'s biography text', example: 'Digital creator & developer' },
  { name: '{{avatar}}', description: 'Profile avatar URL', example: 'https://...' },
  { name: '{{socialLinks}}', description: 'Rendered social media links', example: '<div>...</div>' },
  { name: '{{contentBlocks}}', description: 'Custom content blocks', example: '<div>...</div>' },
  { name: '{{primaryColor}}', description: 'Primary theme color', example: '#8B5CF6' },
  { name: '{{backgroundColor}}', description: 'Background color', example: '#0a0a0a' },
  { name: '{{fontFamily}}', description: 'Selected font family', example: 'DM Sans' },
];

const ADVANCED_TEMPLATES = [
  {
    name: 'Minimal Card Layout',
    code: `<div class="min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
    <div class="text-center mb-8">
      <div class="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500"></div>
      <h1 class="text-3xl font-bold mb-2">@{{username}}</h1>
      <p class="text-gray-400">{{bio}}</p>
    </div>
    <div class="space-y-3">
      {{socialLinks}}
    </div>
  </div>
</div>`
  },
  {
    name: 'Grid Layout',
    code: `<div class="container mx-auto p-6">
  <header class="text-center mb-12">
    <h1 class="text-5xl font-black mb-4">{{username}}</h1>
    <p class="text-xl text-gray-400">{{bio}}</p>
  </header>
  <div class="grid md:grid-cols-2 gap-6 mb-8">
    {{socialLinks}}
  </div>
  <div class="mt-12">
    {{contentBlocks}}
  </div>
</div>`
  },
  {
    name: 'Sidebar Layout',
    code: `<div class="flex min-h-screen">
  <aside class="w-80 bg-gradient-to-b from-purple-900 to-black p-8 sticky top-0 h-screen">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-2">@{{username}}</h2>
      <p class="text-sm text-gray-300 mb-6">{{bio}}</p>
    </div>
    <nav class="space-y-3">
      {{socialLinks}}
    </nav>
  </aside>
  <main class="flex-1 p-12">
    {{contentBlocks}}
  </main>
</div>`
  }
];

export function TemplateEditor({ profile, onUpdate }: TemplateEditorProps) {
  const [templateHTML, setTemplateHTML] = useState(
    profile.templateHTML || DEFAULT_TEMPLATE_HTML
  );
  const [useCustomTemplate, setUseCustomTemplate] = useState(
    profile.useCustomTemplate || false
  );
  const [previewMode, setPreviewMode] = useState<'split' | 'preview'>('split');
  const [copied, setCopied] = useState<string | null>(null);

  // Generate live preview by replacing placeholders with sample data
  const previewHTML = useMemo(() => {
    let html = templateHTML;
    
    // Replace placeholders with sample data
    html = html.replace(/\{\{username\}\}/g, profile.username || 'username');
    html = html.replace(/\{\{bio\}\}/g, profile.bio || 'Your bio goes here...');
    html = html.replace(/\{\{avatar\}\}/g, profile.avatar || '/placeholder-avatar.png');
    html = html.replace(/\{\{primaryColor\}\}/g, profile.primaryColor || '#8B5CF6');
    html = html.replace(/\{\{backgroundColor\}\}/g, profile.backgroundColor || '#0a0a0a');
    html = html.replace(/\{\{fontFamily\}\}/g, profile.fontFamily || 'DM Sans');
    
    // Sample social links
    html = html.replace(/\{\{socialLinks\}\}/g, `
      <div class="space-y-3">
        <a href="#" class="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
          <span class="font-semibold">🔗 Sample Link</span>
        </a>
        <a href="#" class="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
          <span class="font-semibold">🌐 Another Link</span>
        </a>
      </div>
    `);
    
    // Sample content blocks
    html = html.replace(/\{\{contentBlocks\}\}/g, `
      <div class="space-y-4">
        <div class="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <h3 class="font-bold mb-2">Sample Content Block</h3>
          <p class="text-sm text-gray-400">This is where your custom content appears.</p>
        </div>
      </div>
    `);
    
    return html;
  }, [templateHTML, profile]);

  // Basic HTML validation
  const validateHTML = (html: string) => {
    const errors: string[] = [];
    
    // Check for unclosed tags (simple check)
    const openTags = html.match(/<(\w+)[^>]*>/g) || [];
    const closeTags = html.match(/<\/(\w+)>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      errors.push('Possible unclosed HTML tags detected');
    }
    
    // Check for dangerous scripts (security)
    if (html.includes('<script')) {
      errors.push('Script tags are not allowed for security reasons');
    }
    
    // Check for inline styles (we want CSS in appearance tab)
    if (html.includes('style=')) {
      errors.push('Inline styles detected - use the Appearance tab for styling');
    }
    
    return errors;
  };

  const validationErrors = useMemo(() => validateHTML(templateHTML), [templateHTML]);

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const loadTemplate = (code: string) => {
    setTemplateHTML(code);
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-template-editor">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Advanced Template Editor</h2>
          <Badge variant="outline" className="ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('split')}
          >
            <Code className="w-4 h-4 mr-1" />
            Split
          </Button>
          <Button
            variant={previewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('preview')}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Advanced feature: Edit the HTML template used to render your profile. Use placeholders for dynamic content.
          <br />
          <strong className="text-yellow-500">Note:</strong> Custom CSS is disabled for security. Use the Appearance tab for styling.
        </AlertDescription>
      </Alert>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

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

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className={previewMode === 'split' ? 'grid grid-cols-2 gap-4' : ''}>
            {/* Code Editor */}
            <div className={previewMode === 'preview' ? 'hidden' : 'space-y-2'}>
              <Label htmlFor="template-html" className="text-base font-semibold flex items-center gap-2">
                <Code className="w-4 h-4" />
                HTML Template
              </Label>
              <Textarea
                id="template-html"
                placeholder={DEFAULT_TEMPLATE_HTML}
                value={templateHTML}
                onChange={(e) => setTemplateHTML(e.target.value)}
                className="min-h-[500px] font-mono text-sm resize-none"
                data-testid="textarea-template-html"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                Lines: {templateHTML.split('\n').length} | Characters: {templateHTML.length}
              </p>
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </Label>
              <div 
                className="min-h-[500px] border rounded-lg p-6 overflow-auto bg-gradient-to-b from-background to-muted/20"
                style={{
                  fontFamily: profile.fontFamily || 'DM Sans',
                  color: profile.primaryColor || '#8B5CF6'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
              </div>
              <p className="text-xs text-muted-foreground">
                ✨ Preview updates in real-time as you type
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Available Template Variables</h3>
            <div className="grid gap-3">
              {TEMPLATE_VARIABLES.map((variable) => (
                <div 
                  key={variable.name}
                  className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-sm font-mono bg-primary/10 px-2 py-1 rounded text-primary">
                      {variable.name}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(variable.name, variable.name)}
                    >
                      {copied === variable.name ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{variable.description}</p>
                  <p className="text-xs text-muted-foreground/70">
                    Example: <code>{variable.example}</code>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Pre-built Templates</h3>
            <p className="text-sm text-muted-foreground">
              Start with a professional template and customize it to your needs
            </p>
            <div className="grid gap-4">
              {ADVANCED_TEMPLATES.map((template, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Button
                      size="sm"
                      onClick={() => loadTemplate(template.code)}
                    >
                      Use Template
                    </Button>
                  </div>
                  <pre className="text-xs bg-black/20 p-3 rounded overflow-x-auto max-h-32">
                    <code>{template.code}</code>
                  </pre>
                </div>
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
          disabled={validationErrors.length > 0}
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
