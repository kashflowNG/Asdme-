
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

const DEFAULT_TEMPLATE_HTML = `<!-- Hero Section -->
<header class="min-h-screen flex items-center justify-center p-6">
  <div class="max-w-4xl w-full text-center">
    <div class="mb-8">
      <div class="w-32 h-32 rounded-full mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500"></div>
      <h1 class="text-5xl font-bold mb-4">@{{username}}</h1>
      <p class="text-xl text-gray-400">{{bio}}</p>
    </div>
    
    <!-- Social Links -->
    <div class="space-y-4 mb-12">
      {{socialLinks}}
    </div>
    
    <!-- Content Blocks -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>
</header>

<!-- Footer Section -->
<footer class="py-12 border-t border-white/10 text-center">
  <div class="max-w-4xl mx-auto px-6">
    <p class="text-gray-400 text-sm mb-4">
      Created with <span class="text-purple-500">Neropage</span>
    </p>
    <p class="text-gray-500 text-xs">
      © 2024 @{{username}}. All rights reserved.
    </p>
  </div>
</footer>`;

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
    name: 'Modern Hero Page',
    code: `<!-- Hero Section -->
<section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 p-8">
  <div class="max-w-5xl w-full">
    <div class="text-center mb-16">
      <div class="inline-block relative mb-8">
        <div class="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 mx-auto"></div>
        <div class="absolute -bottom-4 -right-4 w-16 h-16 bg-green-500 rounded-full border-4 border-black"></div>
      </div>
      <h1 class="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        @{{username}}
      </h1>
      <p class="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">{{bio}}</p>
    </div>
    
    <div class="grid md:grid-cols-2 gap-4 mb-12">
      {{socialLinks}}
    </div>
    
    <div class="space-y-8">
      {{contentBlocks}}
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="bg-black/50 backdrop-blur-lg border-t border-white/10 py-12">
  <div class="max-w-5xl mx-auto px-8 text-center">
    <div class="flex items-center justify-center gap-6 mb-6 text-gray-400">
      <a href="#" class="hover:text-white transition-colors">About</a>
      <span>•</span>
      <a href="#" class="hover:text-white transition-colors">Contact</a>
      <span>•</span>
      <a href="#" class="hover:text-white transition-colors">Privacy</a>
    </div>
    <p class="text-gray-500 text-sm">
      © 2024 @{{username}} • Powered by <span class="text-purple-400">Neropage</span>
    </p>
  </div>
</footer>`
  },
  {
    name: 'Split Screen Layout',
    code: `<div class="grid md:grid-cols-2 min-h-screen">
  <!-- Left Panel - Hero -->
  <div class="bg-gradient-to-br from-purple-600 to-pink-600 p-12 flex items-center justify-center">
    <div class="text-center">
      <div class="w-32 h-32 rounded-full bg-white/20 backdrop-blur-lg mx-auto mb-8"></div>
      <h1 class="text-5xl font-black text-white mb-4">@{{username}}</h1>
      <p class="text-xl text-white/90">{{bio}}</p>
    </div>
  </div>
  
  <!-- Right Panel - Content -->
  <div class="p-12 flex flex-col">
    <div class="flex-1">
      <h2 class="text-3xl font-bold mb-8">My Links</h2>
      <div class="space-y-4 mb-12">
        {{socialLinks}}
      </div>
      
      <div class="space-y-6">
        {{contentBlocks}}
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
      <p>© 2024 @{{username}}</p>
    </footer>
  </div>
</div>`
  },
  {
    name: 'Card Stack Layout',
    code: `<!-- Hero -->
<header class="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-purple-900/30 to-black p-8">
  <div class="text-center">
    <div class="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-6 rotate-6 shadow-2xl"></div>
    <h1 class="text-5xl font-black mb-4">@{{username}}</h1>
    <p class="text-xl text-gray-400 max-w-md mx-auto">{{bio}}</p>
  </div>
</header>

<!-- Main Content -->
<main class="max-w-3xl mx-auto px-6 py-12 -mt-20">
  <div class="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl mb-8">
    <h2 class="text-2xl font-bold mb-6 text-center">Connect With Me</h2>
    <div class="space-y-4">
      {{socialLinks}}
    </div>
  </div>
  
  <div class="space-y-6">
    {{contentBlocks}}
  </div>
</main>

<!-- Footer -->
<footer class="py-16 bg-gradient-to-t from-purple-900/20 to-transparent border-t border-white/5">
  <div class="max-w-3xl mx-auto px-6 text-center">
    <div class="flex justify-center gap-8 mb-6 text-gray-400 text-sm">
      <a href="#" class="hover:text-purple-400 transition-colors">Home</a>
      <a href="#" class="hover:text-purple-400 transition-colors">About</a>
      <a href="#" class="hover:text-purple-400 transition-colors">Contact</a>
    </div>
    <p class="text-gray-500 text-sm">
      Made with ❤️ using <span class="text-purple-400 font-semibold">Neropage</span>
    </p>
  </div>
</footer>`
  },
  {
    name: 'Minimalist Full Page',
    code: `<!-- Hero Section -->
<div class="min-h-screen flex flex-col">
  <header class="flex-1 flex items-center justify-center p-8">
    <div class="max-w-2xl w-full text-center">
      <div class="mb-12">
        <div class="w-24 h-24 rounded-full bg-white/10 mx-auto mb-6"></div>
        <h1 class="text-4xl font-light mb-3 tracking-wide">@{{username}}</h1>
        <p class="text-gray-400 text-lg">{{bio}}</p>
      </div>
      
      <div class="space-y-3 mb-16">
        {{socialLinks}}
      </div>
      
      <div class="space-y-4">
        {{contentBlocks}}
      </div>
    </div>
  </header>
  
  <!-- Footer -->
  <footer class="border-t border-white/5 py-8 text-center">
    <p class="text-gray-500 text-sm">
      @{{username}} • 2024
    </p>
  </footer>
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

  // Update local state when profile changes (after save)
  useEffect(() => {
    if (profile.templateHTML) {
      setTemplateHTML(profile.templateHTML);
    }
    setUseCustomTemplate(profile.useCustomTemplate || false);
  }, [profile.templateHTML, profile.useCustomTemplate]);

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
    
    // Check for dangerous scripts (security)
    if (html.includes('<script')) {
      errors.push('Script tags are not allowed for security reasons');
    }
    
    // Check for dangerous event handlers
    const dangerousPatterns = ['onclick', 'onerror', 'onload', 'javascript:'];
    for (const pattern of dangerousPatterns) {
      if (html.toLowerCase().includes(pattern)) {
        errors.push(`Potentially dangerous pattern detected: ${pattern}`);
        break;
      }
    }
    
    return errors;
  };

  const validationErrors = useMemo(() => validateHTML(templateHTML), [templateHTML]);

  const handleSave = async () => {
    if (validationErrors.length > 0) {
      return;
    }
    
    try {
      await onUpdate({
        templateHTML,
        useCustomTemplate,
      });
      
      // Show success feedback
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Template saved!',
          description: 'Your custom template has been saved successfully.',
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to save template:', error);
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Error',
          description: 'Failed to save template. Please try again.',
          variant: 'destructive',
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleReset = () => {
    if (templateHTML !== DEFAULT_TEMPLATE_HTML) {
      if (!confirm('This will reset your template to default. Continue?')) {
        return;
      }
    }
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
    if (templateHTML !== DEFAULT_TEMPLATE_HTML && templateHTML !== code) {
      if (!confirm('Loading this template will replace your current code. Continue?')) {
        return;
      }
    }
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
          <strong className="text-yellow-500">Note:</strong> Inline styles and Tailwind classes are supported. Script tags are disabled for security.
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
              <div className="min-h-[500px] border rounded-lg overflow-hidden bg-gradient-to-b from-background to-muted/20">
                <iframe
                  className="w-full h-[500px] bg-transparent"
                  sandbox="allow-same-origin"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                          body {
                            margin: 0;
                            padding: 1.5rem;
                            font-family: ${profile.fontFamily || 'DM Sans'}, sans-serif;
                            background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.05));
                            color: #ffffff;
                          }
                          * {
                            box-sizing: border-box;
                          }
                          a {
                            text-decoration: none;
                            color: inherit;
                          }
                        </style>
                      </head>
                      <body>
                        ${previewHTML}
                      </body>
                    </html>
                  `}
                />
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
