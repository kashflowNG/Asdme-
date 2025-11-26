import { useState, useEffect, useMemo, useRef } from "react";
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
import { queryClient } from "@/lib/queryClient";

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
  { category: 'Profile Info', variables: [
    { name: '{{username}}', description: 'User\'s username', example: '@johndoe' },
    { name: '{{bio}}', description: 'User\'s biography/short description', example: 'Digital creator & developer' },
    { name: '{{avatar}}', description: 'Profile avatar/picture URL', example: 'https://example.com/avatar.jpg' },
    { name: '{{coverPhoto}}', description: 'Cover photo/banner image URL', example: 'https://example.com/cover.jpg' },
    { name: '{{aboutMe}}', description: 'User\'s about me/personal statement', example: 'Passionate about technology...' },
    { name: '{{businessInfo}}', description: 'Business details & information', example: 'Services: Design, Development...' },
  ]},
  { category: 'Content', variables: [
    { name: '{{socialLinks}}', description: 'All rendered social media links', example: '<a href="...">Link</a>' },
    { name: '{{contentBlocks}}', description: 'Custom content blocks (videos, images, text)', example: '<div class="content">...</div>' },
  ]},
  { category: 'Theme & Styling', variables: [
    { name: '{{primaryColor}}', description: 'Primary theme color (from customization)', example: '#8B5CF6' },
    { name: '{{backgroundColor}}', description: 'Background color (from customization)', example: '#0a0a0a' },
    { name: '{{fontFamily}}', description: 'Selected font family name', example: 'DM Sans' },
  ]},
];

const ADVANCED_TEMPLATES = [
  {
    name: 'Facebook Premium Profile',
    description: 'Modern Facebook-style layout with cover photo and profile card',
    preview: '📘',
    color: 'from-blue-600 to-blue-800',
    code: `<!-- Facebook-Style Premium Profile -->
<div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black">
  <!-- Cover Photo Section -->
  <div class="relative h-96 w-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
    <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1)), linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1)); background-size: 60px 60px; background-position: 0 0, 30px 30px;"></div>
  </div>

  <!-- Profile Card (Overlapping) -->
  <div class="max-w-5xl mx-auto px-6 relative">
    <div class="relative -mt-32 mb-8">
      <div class="bg-gradient-to-br from-gray-900/95 to-gray-950/95 rounded-3xl border border-gray-700 shadow-2xl p-8">
        <!-- Profile Header Row -->
        <div class="flex flex-col md:flex-row items-center md:items-end gap-6">
          <!-- Avatar -->
          <div class="relative -mt-20 shrink-0">
            <div class="absolute -inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-60"></div>
            <div class="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-gray-900 shadow-2xl"></div>
          </div>

          <!-- User Info -->
          <div class="flex-1 text-center md:text-left mb-2">
            <h1 class="text-5xl font-black text-white mb-2">@{{username}}</h1>
            <p class="text-xl text-gray-300 mb-4">{{bio}}</p>
            <div class="flex flex-wrap gap-2 justify-center md:justify-start">
              <span class="px-4 py-2 bg-blue-600/30 border border-blue-500/50 rounded-full text-blue-300 text-sm">🔗 Creator</span>
              <span class="px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-full text-purple-300 text-sm">🚀 Active</span>
            </div>
          </div>
        </div>

        <!-- About Section -->
        {{aboutMe ? \`<div class="mt-8 pt-8 border-t border-gray-700">
          <h3 class="text-lg font-bold text-white mb-3">📝 About</h3>
          <p class="text-gray-300 leading-relaxed">{{aboutMe}}</p>
        </div>\` : ''}}

        <!-- Business Section -->
        {{businessInfo ? \`<div class="mt-6 pt-6 border-t border-gray-700">
          <h3 class="text-lg font-bold text-white mb-3">💼 What I Offer</h3>
          <p class="text-gray-300 leading-relaxed whitespace-pre-line">{{businessInfo}}</p>
        </div>\` : ''}}
      </div>
    </div>

    <!-- Social Links Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-white mb-6">Connect With Me</h2>
      <div class="grid md:grid-cols-3 gap-4">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content Blocks -->
    <div class="space-y-6 pb-12">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-gray-700 bg-black/50 py-8 mt-12">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <p class="text-gray-400">© 2024 @{{username}} • Powered by <span class="text-blue-400 font-semibold">Neropage</span></p>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Neon Cyberpunk Pro',
    description: 'Bold neon with grid background and animated elements',
    preview: '🌃',
    color: 'from-cyan-500 to-purple-600',
    code: `<!-- Neon Cyberpunk Premium -->
<div class="min-h-screen bg-black relative overflow-hidden">
  <!-- Animated Grid -->
  <div class="absolute inset-0" style="background-image: linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px); background-size: 50px 50px;"></div>
  
  <!-- Gradient Orbs -->
  <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl"></div>
  <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>

  <div class="relative z-10 max-w-5xl mx-auto px-6 py-16">
    <!-- Hero Header -->
    <div class="text-center mb-20">
      <div class="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 mx-auto mb-8 shadow-[0_0_40px_rgba(6,182,212,0.8)]"></div>
      <h1 class="text-7xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">@{{username}}</h1>
      <p class="text-2xl text-cyan-300 mb-8 font-mono">{{bio}}</p>
      <div class="flex items-center justify-center gap-2">
        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-cyan-300 font-mono uppercase tracking-wider">ONLINE • ACTIVE</span>
      </div>
    </div>

    <!-- About Section -->
    {{aboutMe ? \`<div class="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-2xl p-8 mb-8 backdrop-blur-xl">
      <h3 class="text-xl font-bold text-cyan-300 mb-3">✦ ABOUT</h3>
      <p class="text-gray-300">{{aboutMe}}</p>
    </div>\` : ''}}

    <!-- Links Grid -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-cyan-300 mb-6 uppercase tracking-wider">📍 Connect</h2>
      <div class="grid md:grid-cols-2 gap-4">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="relative z-10 border-t border-cyan-500/30 py-8 mt-16">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <p class="text-cyan-400 font-mono text-sm">© 2024 @{{username}} • <span class="text-purple-400">NEROPAGE</span> CYBERPUNK</p>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Glass Premium',
    description: 'Modern glassmorphism with depth and transparency effects',
    preview: '💎',
    color: 'from-blue-400 to-violet-500',
    code: `<!-- Glassmorphism Premium -->
<div class="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black">
  <!-- Animated Background -->
  <div class="absolute inset-0">
    <div class="absolute top-20 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
  </div>

  <div class="relative z-10 max-w-5xl mx-auto px-6 py-16">
    <!-- Profile Section -->
    <div class="text-center mb-16">
      <div class="w-40 h-40 rounded-2xl mx-auto mb-8 bg-gradient-to-br from-blue-400/50 to-purple-500/50 backdrop-blur-xl border border-white/20 shadow-2xl"></div>
      <h1 class="text-6xl font-black mb-4 text-white">@{{username}}</h1>
      <p class="text-xl text-gray-200 max-w-2xl mx-auto">{{bio}}</p>
    </div>

    <!-- Glass Card - About -->
    {{aboutMe ? \`<div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-6 shadow-2xl">
      <h3 class="text-xl font-bold text-blue-300 mb-3">About</h3>
      <p class="text-gray-100">{{aboutMe}}</p>
    </div>\` : ''}}

    <!-- Glass Card - Business -->
    {{businessInfo ? \`<div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
      <h3 class="text-xl font-bold text-purple-300 mb-3">Services</h3>
      <p class="text-gray-100 whitespace-pre-line">{{businessInfo}}</p>
    </div>\` : ''}}

    <!-- Links -->
    <div class="backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
      <h2 class="text-2xl font-bold text-white mb-6">Connect</h2>
      <div class="space-y-3">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="relative z-10 backdrop-blur-xl bg-black/30 border-t border-white/10 py-8 mt-16">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <p class="text-gray-400">© 2024 @{{username}} • <span class="text-white">Neropage</span></p>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Minimalist Clean',
    description: 'Simple elegant design focused on content',
    preview: '⚪',
    color: 'from-slate-400 to-slate-600',
    code: `<!-- Minimalist Clean -->
<div class="min-h-screen bg-slate-950 text-white">
  <div class="max-w-3xl mx-auto px-6 py-20">
    <!-- Header -->
    <header class="mb-20 text-center">
      <div class="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 mx-auto mb-8"></div>
      <h1 class="text-5xl font-light mb-2 tracking-tight">@{{username}}</h1>
      <div class="w-12 h-px bg-slate-600 mx-auto mb-6"></div>
      <p class="text-lg text-slate-400 leading-relaxed">{{bio}}</p>
    </header>

    <!-- About -->
    {{aboutMe ? \`<div class="mb-12 pb-12 border-b border-slate-700">
      <p class="text-slate-300 leading-relaxed">{{aboutMe}}</p>
    </div>\` : ''}}

    <!-- Links -->
    <div class="space-y-2 mb-16">
      {{socialLinks}}
    </div>

    <!-- Content -->
    <div class="space-y-12">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-slate-700 py-12 mt-20">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <p class="text-sm text-slate-500">© 2024 @{{username}} • Neropage</p>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Gradient Luxury',
    description: 'Premium luxury with gradient accents and elegant spacing',
    preview: '👑',
    color: 'from-amber-600 to-orange-600',
    code: `<!-- Luxury Gradient Premium -->
<div class="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
  <div class="max-w-5xl mx-auto px-6 py-16">
    <!-- Luxury Header -->
    <div class="text-center mb-16 pb-12 border-b border-amber-600/30">
      <div class="w-40 h-40 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mx-auto mb-8 shadow-[0_0_50px_rgba(217,119,6,0.4)]"></div>
      <h1 class="text-7xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">@{{username}}</h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto italic mb-4">{{bio}}</p>
      <div class="flex items-center justify-center gap-2">
        <div class="h-px w-8 bg-amber-600/50"></div>
        <span class="text-amber-500 font-semibold uppercase tracking-widest text-sm">Premium</span>
        <div class="h-px w-8 bg-amber-600/50"></div>
      </div>
    </div>

    <!-- About & Business -->
    <div class="grid md:grid-cols-2 gap-6 mb-12">
      {{aboutMe ? \`<div class="border-l-2 border-amber-500 pl-6 py-4">
        <h3 class="text-lg font-bold text-amber-400 mb-2">About</h3>
        <p class="text-gray-300 leading-relaxed">{{aboutMe}}</p>
      </div>\` : ''}}
      {{businessInfo ? \`<div class="border-l-2 border-orange-500 pl-6 py-4">
        <h3 class="text-lg font-bold text-orange-400 mb-2">Services</h3>
        <p class="text-gray-300 leading-relaxed whitespace-pre-line">{{businessInfo}}</p>
      </div>\` : ''}}
    </div>

    <!-- Links Grid -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-center mb-8 text-white">Connect</h2>
      <div class="grid md:grid-cols-2 gap-4">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-amber-600/20 py-12 mt-16 text-center">
    <p class="text-gray-500 text-sm">© 2024 @{{username}} • Premium by <span class="text-amber-500">Neropage</span></p>
  </footer>
</div>`
  },
  {
    name: 'Vibrant Rainbow',
    description: 'Colorful vibrant gradients with playful energy',
    preview: '🌈',
    color: 'from-pink-500 via-purple-500 to-indigo-500',
    code: `<!-- Vibrant Rainbow -->
<div class="min-h-screen relative overflow-hidden">
  <!-- Animated Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700"></div>
  <div class="absolute inset-0 bg-gradient-to-tl from-yellow-400/20 via-transparent to-cyan-400/20"></div>

  <!-- Floating Orbs -->
  <div class="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" style="animation-delay: 2s;"></div>

  <div class="relative z-10 max-w-5xl mx-auto px-6 py-16">
    <!-- Playful Header -->
    <div class="text-center mb-16">
      <div class="w-40 h-40 rounded-3xl bg-white/20 backdrop-blur-md mx-auto mb-8 shadow-2xl border border-white/40"></div>
      <h1 class="text-7xl font-black mb-4 text-white drop-shadow-2xl">@{{username}}</h1>
      <p class="text-2xl text-white/95 max-w-2xl mx-auto mb-8">{{bio}}</p>
      <div class="flex items-center justify-center gap-3">
        <span class="text-2xl">✨</span>
        <p class="text-white font-semibold">Creator • Active</p>
        <span class="text-2xl">✨</span>
      </div>
    </div>

    <!-- About Section -->
    {{aboutMe ? \`<div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
      <p class="text-white text-lg leading-relaxed">{{aboutMe}}</p>
    </div>\` : ''}}

    <!-- Links Grid -->
    <div class="mb-12">
      <div class="grid md:grid-cols-2 gap-4">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="relative z-10 backdrop-blur-xl bg-black/30 border-t border-white/20 py-8 mt-16">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <p class="text-white/70">Made with 💖 on <span class="font-bold">Neropage</span></p>
    </div>
  </footer>
</div>`
  },
];

const QUICK_CODE_SNIPPETS = [
  {
    name: 'Profile Header with Cover',
    code: `<!-- Facebook-Style Cover + Profile Header -->
<div class="relative">
  <!-- Cover Photo -->
  <div class="h-80 w-full bg-gradient-to-br from-purple-600 to-blue-600"></div>
  
  <!-- Profile Card Overlay -->
  <div class="max-w-6xl mx-auto px-6 relative -mt-20">
    <div class="bg-gray-900 rounded-2xl p-8 border border-gray-700">
      <div class="flex items-end gap-6">
        <div class="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-gray-900"></div>
        <div class="flex-1 pb-2">
          <h1 class="text-4xl font-bold text-white mb-2">@{{username}}</h1>
          <p class="text-gray-400">{{bio}}</p>
        </div>
      </div>
    </div>
  </div>
</div>`
  },
  {
    name: 'Social Links Grid',
    code: `<!-- Clean Social Links Grid -->
<div class="max-w-6xl mx-auto px-6 py-12">
  <h2 class="text-2xl font-bold text-white mb-8">Follow Me</h2>
  <div class="grid md:grid-cols-3 gap-4">
    {{socialLinks}}
  </div>
</div>`
  },
  {
    name: 'About & Business Section',
    code: `<!-- About & Business Info -->
<div class="max-w-6xl mx-auto px-6 py-12">
  <div class="grid md:grid-cols-2 gap-8">
    <div class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
      <h3 class="text-xl font-bold text-purple-400 mb-4">📝 About Me</h3>
      <p class="text-gray-300 leading-relaxed">{{aboutMe}}</p>
    </div>
    <div class="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
      <h3 class="text-xl font-bold text-cyan-400 mb-4">💼 My Services</h3>
      <p class="text-gray-300 leading-relaxed whitespace-pre-line">{{businessInfo}}</p>
    </div>
  </div>
</div>`
  },
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      // Ensure we're sending valid data
      const updates: any = {
        templateHTML: templateHTML.trim() || '',
        useCustomTemplate: useCustomTemplate,
      };

      console.log('Saving template with data:', {
        templateLength: updates.templateHTML.length,
        useCustomTemplate: updates.useCustomTemplate
      });

      await onUpdate(updates);

      // Show success feedback
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Template saved!',
          description: 'Your custom template has been saved successfully.',
        }
      });
      window.dispatchEvent(event);

      // Invalidate the profile query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/me'] });
    } catch (error: any) {
      console.error('Template save error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to save template. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.details) {
        errorMessage = `Validation error: ${JSON.stringify(error.details)}`;
      }
      
      const event = new CustomEvent('toast', {
        detail: {
          title: 'Error',
          description: errorMessage,
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
          <strong>Your profile uses a beautiful default layout.</strong> Enable "Use Custom Template" below to design your own unique landing page with HTML & Tailwind CSS.
          <br />
          <strong className="text-yellow-500">Pro Tip:</strong> Choose from 6 pre-built templates or create your own. Inline styles and Tailwind classes are fully supported.
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="snippets">Snippets</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
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
                ref={textareaRef}
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

        <TabsContent value="variables" className="space-y-6">
          <div className="flex items-center justify-between">
            <Alert className="flex-1">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Use these variables in your HTML template. They'll be automatically replaced with your profile information.
              </AlertDescription>
            </Alert>
            <Button
              className="ml-4"
              onClick={() => {
                const allVars = TEMPLATE_VARIABLES
                  .flatMap(group => group.variables.map(v => v.name))
                  .join('\n');
                copyToClipboard(allVars, 'all-variables');
              }}
            >
              {copied === 'all-variables' ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy All
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            {TEMPLATE_VARIABLES.map((group) => (
              <div key={group.category} className="space-y-3">
                <h3 className="text-lg font-bold text-primary">{group.category}</h3>
                <div className="grid gap-3">
                  {group.variables.map((variable) => (
                    <div 
                      key={variable.name}
                      className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <code className="text-sm font-mono bg-primary/10 px-3 py-1.5 rounded text-primary font-bold">
                            {variable.name}
                          </code>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(variable.name, variable.name)}
                          className="ml-2"
                        >
                          {copied === variable.name ? (
                            <>
                              <Check className="w-4 h-4 text-green-500 mr-1" />
                              <span className="text-xs">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{variable.description}</p>
                      <p className="text-xs text-muted-foreground/70 font-mono bg-black/30 p-2 rounded">
                        Example: {variable.example}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Card className="p-4 bg-green-500/10 border border-green-500/30">
            <h4 className="font-bold text-green-400 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use <code className="font-mono">style</code> attribute for inline CSS styling</li>
              <li>• Tailwind CSS classes work perfectly in templates</li>
              <li>• All HTML elements are supported (except script tags for security)</li>
              <li>• Variables are case-sensitive: use <code className="font-mono">{`{{username}}`}</code> exactly</li>
              <li>• Test your template in the Live Preview before saving</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="snippets" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Ready-Made Code Snippets</h3>
              <p className="text-sm text-muted-foreground">
                One-tap copy for each snippet. Perfect for building custom templates!
              </p>
            </div>
            <Button
              onClick={() => {
                const allCode = QUICK_CODE_SNIPPETS
                  .map(s => `<!-- ${s.name} -->\n${s.code}`)
                  .join('\n\n');
                copyToClipboard(allCode, 'all-snippets');
              }}
            >
              {copied === 'all-snippets' ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy All Snippets
                </>
              )}
            </Button>
          </div>
          <div className="grid gap-4">
            {QUICK_CODE_SNIPPETS.map((snippet, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border border-border bg-muted/20 space-y-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    {snippet.name}
                  </h4>
                </div>
                <pre className="bg-black/50 p-3 rounded text-xs overflow-x-auto font-mono text-green-400 max-h-24">
                  {snippet.code.substring(0, 200)}...
                </pre>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(snippet.code);
                      setCopied(`snippet-${index}`);
                      setTimeout(() => setCopied(null), 2000);
                    }}
                  >
                    {copied === `snippet-${index}` ? (
                      <>
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Full Code
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTemplateHTML(snippet.code);
                      setTimeout(() => {
                        const tabs = document.querySelector('[role="tablist"]');
                        const editorTab = tabs?.querySelector('[value="editor"]');
                        (editorTab as HTMLElement)?.click();
                        textareaRef.current?.focus();
                      }, 100);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Professional Landing Pages</h3>
              <p className="text-sm text-muted-foreground">
                Choose from 6 expertly designed templates. No coding required - just click "Use Template" and customize!
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {ADVANCED_TEMPLATES.map((template, index) => (
                <div 
                  key={index}
                  className="group relative rounded-xl bg-muted/30 border-2 border-border hover:border-primary/50 transition-all overflow-hidden hover:shadow-2xl hover:scale-[1.02]"
                >
                  {/* Preview Header */}
                  <div className={`h-32 bg-gradient-to-r ${template.color} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-6xl relative z-10 drop-shadow-lg">{template.preview}</span>
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-black/50 border-white/20">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-5">
                    <h4 className="font-bold text-lg mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        Responsive
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Animated
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Modern
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => loadTemplate(template.code)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          copyToClipboard(template.code, `template-${index}`);
                          const event = new CustomEvent('toast', {
                            detail: {
                              title: 'Template copied!',
                              description: 'Template code copied to clipboard.',
                            }
                          });
                          window.dispatchEvent(event);
                        }}
                      >
                        {copied === `template-${index}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Hover Preview */}
                  <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity p-4 overflow-auto">
                    <div className="text-xs font-mono text-gray-300">
                      <pre className="whitespace-pre-wrap break-words">
                        {template.code.substring(0, 300)}...
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Text */}
            <Alert className="mt-6">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> After selecting a template, you can customize colors, fonts, and content in the Editor tab. Your changes are saved automatically!
              </AlertDescription>
            </Alert>
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