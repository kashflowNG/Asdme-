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
    name: 'Neon Cyberpunk',
    description: 'Bold neon colors with futuristic cyberpunk aesthetics',
    preview: '🌃',
    color: 'from-cyan-500 to-purple-500',
    code: `<!-- Cyberpunk Hero -->
<div class="min-h-screen bg-black relative overflow-hidden">
  <!-- Animated Grid Background -->
  <div class="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-cyan-900/20"></div>
  <div class="absolute inset-0" style="background-image: linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>

  <div class="relative z-10 max-w-4xl mx-auto px-6 py-16">
    <!-- Profile Section -->
    <div class="text-center mb-16">
      <div class="relative inline-block mb-8">
        <div class="w-40 h-40 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 mx-auto transform rotate-3 shadow-[0_0_50px_rgba(6,182,212,0.5)]"></div>
        <div class="absolute top-0 right-0 w-8 h-8 bg-pink-500 rounded-full animate-pulse"></div>
      </div>
      <h1 class="text-7xl font-black mb-4 tracking-tight" style="text-shadow: 0 0 20px rgba(6,182,212,0.8), 0 0 40px rgba(139,92,246,0.6);">
        <span class="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          @{{username}}
        </span>
      </h1>
      <p class="text-xl text-cyan-300 max-w-2xl mx-auto font-mono">{{bio}}</p>
      <div class="mt-6 flex items-center justify-center gap-2">
        <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-sm text-gray-400 font-mono">ONLINE • AVAILABLE</span>
      </div>
    </div>

    <!-- Links Grid -->
    <div class="grid md:grid-cols-2 gap-4 mb-12">
      {{socialLinks}}
    </div>

    <!-- Content Blocks -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="relative z-10 border-t border-cyan-500/30 py-8 mt-16">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <p class="text-gray-500 text-sm font-mono">
        © 2024 @{{username}} • <span class="text-cyan-400">NEROPAGE</span> v2.0
      </p>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Elegant Portfolio',
    description: 'Sophisticated design perfect for creative professionals',
    preview: '🎨',
    color: 'from-amber-500 to-rose-500',
    code: `<!-- Portfolio Hero -->
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
  <div class="max-w-6xl mx-auto px-6 py-12">
    <!-- Header -->
    <header class="flex items-center justify-between mb-20 pb-8 border-b border-amber-500/20">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-rose-500"></div>
        <div>
          <h1 class="text-3xl font-serif font-bold text-amber-100">@{{username}}</h1>
          <p class="text-sm text-gray-400">Creative Professional</p>
        </div>
      </div>
      <div class="hidden md:flex gap-6 text-sm text-gray-400">
        <a href="#work" class="hover:text-amber-400 transition-colors">Work</a>
        <a href="#about" class="hover:text-amber-400 transition-colors">About</a>
        <a href="#contact" class="hover:text-amber-400 transition-colors">Contact</a>
      </div>
    </header>

    <!-- Bio Section -->
    <div class="max-w-3xl mb-16">
      <h2 class="text-5xl md:text-6xl font-serif font-bold mb-6 text-white leading-tight">
        Crafting Digital Experiences
      </h2>
      <p class="text-xl text-gray-300 leading-relaxed">{{bio}}</p>
    </div>

    <!-- Featured Links -->
    <div class="mb-16">
      <h3 class="text-2xl font-serif font-bold mb-8 text-amber-100">Connect & Explore</h3>
      <div class="grid md:grid-cols-3 gap-6">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content Showcase -->
    <div class="space-y-8">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-amber-500/20 py-12 mt-20">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-gray-400 text-sm">© 2024 @{{username}}. All rights reserved.</p>
        <p class="text-gray-500 text-sm">Designed with <span class="text-amber-400">Neropage</span></p>
      </div>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Glassmorphism Pro',
    description: 'Modern glass effect with depth and transparency',
    preview: '💎',
    color: 'from-blue-400 to-violet-500',
    code: `<!-- Glass Hero -->
<div class="min-h-screen relative overflow-hidden">
  <!-- Animated Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
  <div class="absolute inset-0 backdrop-blur-3xl bg-black/30"></div>

  <!-- Floating Orbs -->
  <div class="absolute top-20 left-20 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
  <div class="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>

  <div class="relative z-10 max-w-4xl mx-auto px-6 py-16">
    <!-- Profile Card -->
    <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 mb-8 shadow-2xl">
      <div class="text-center">
        <div class="w-32 h-32 rounded-full bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-sm border border-white/30 mx-auto mb-6 shadow-xl"></div>
        <h1 class="text-6xl font-black mb-4 text-white drop-shadow-lg">
          @{{username}}
        </h1>
        <p class="text-xl text-white/90 max-w-2xl mx-auto">{{bio}}</p>
      </div>
    </div>

    <!-- Links Container -->
    <div class="backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
      <h2 class="text-2xl font-bold text-white mb-6 text-center">My Platforms</h2>
      <div class="space-y-4">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content Blocks -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="relative z-10 backdrop-blur-xl bg-black/20 border-t border-white/10 py-8 mt-16">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <p class="text-white/60 text-sm">
        © 2024 @{{username}} • Powered by <span class="text-white font-semibold">Neropage</span>
      </p>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Minimal Zen',
    description: 'Clean, focused design with maximum simplicity',
    preview: '⚪',
    color: 'from-gray-400 to-gray-600',
    code: `<!-- Zen Layout -->
<div class="min-h-screen bg-white text-black">
  <div class="max-w-2xl mx-auto px-6 py-20">
    <!-- Minimal Header -->
    <header class="mb-20 text-center">
      <div class="w-20 h-20 rounded-full bg-black mx-auto mb-8"></div>
      <h1 class="text-5xl font-light mb-4 tracking-tight">@{{username}}</h1>
      <div class="w-16 h-px bg-black/20 mx-auto mb-6"></div>
      <p class="text-lg text-gray-600 leading-relaxed">{{bio}}</p>
    </header>

    <!-- Clean Links -->
    <div class="space-y-2 mb-16">
      {{socialLinks}}
    </div>

    <!-- Content -->
    <div class="space-y-12">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-black/10 py-12 mt-20">
    <div class="max-w-2xl mx-auto px-6 text-center">
      <p class="text-sm text-gray-400">@{{username}} • 2024</p>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Dark Luxury',
    description: 'Premium dark theme with golden accents',
    preview: '🏆',
    color: 'from-yellow-600 to-orange-600',
    code: `<!-- Luxury Hero -->
<div class="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
  <!-- Subtle Pattern -->
  <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #FFD700 1px, transparent 1px); background-size: 30px 30px;"></div>

  <div class="relative z-10 max-w-5xl mx-auto px-6 py-16">
    <!-- Luxury Header -->
    <div class="text-center mb-16 pb-12 border-b border-yellow-600/20">
      <div class="inline-block relative mb-8">
        <div class="w-36 h-36 rounded-full bg-gradient-to-br from-yellow-600 via-yellow-500 to-orange-500 mx-auto shadow-[0_0_60px_rgba(234,179,8,0.4)]"></div>
        <div class="absolute inset-0 rounded-full border-2 border-yellow-500/30 animate-ping"></div>
      </div>
      <h1 class="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
        @{{username}}
      </h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto italic">{{bio}}</p>
      <div class="mt-8 flex items-center justify-center gap-3">
        <div class="h-px w-16 bg-gradient-to-r from-transparent to-yellow-600/50"></div>
        <span class="text-yellow-600 text-sm font-semibold tracking-widest">EXCLUSIVE</span>
        <div class="h-px w-16 bg-gradient-to-l from-transparent to-yellow-600/50"></div>
      </div>
    </div>

    <!-- Premium Links -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold text-center mb-10 text-yellow-100">VIP Access</h2>
      <div class="grid md:grid-cols-2 gap-6">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-8">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Luxury Footer -->
  <footer class="relative z-10 border-t border-yellow-600/20 py-12 mt-20">
    <div class="max-w-5xl mx-auto px-6">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-3 text-yellow-600">
          <div class="w-8 h-px bg-yellow-600/50"></div>
          <span class="text-sm font-semibold tracking-widest">PREMIUM</span>
          <div class="w-8 h-px bg-yellow-600/50"></div>
        </div>
        <p class="text-gray-500 text-sm">© 2024 @{{username}} • Crafted with <span class="text-yellow-600">Neropage</span></p>
      </div>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Gradient Paradise',
    description: 'Vibrant multi-color gradients with playful energy',
    preview: '🌈',
    color: 'from-pink-500 via-purple-500 to-indigo-500',
    code: `<!-- Rainbow Hero -->
<div class="min-h-screen relative overflow-hidden">
  <!-- Animated Gradient Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 animate-gradient-shift"></div>
  <div class="absolute inset-0 bg-gradient-to-tl from-yellow-400/20 via-transparent to-cyan-400/20"></div>

  <!-- Animated Shapes -->
  <div class="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
  <div class="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>

  <div class="relative z-10 max-w-5xl mx-auto px-6 py-16">
    <!-- Playful Header -->
    <div class="text-center mb-16">
      <div class="relative inline-block mb-8">
        <div class="w-40 h-40 rounded-3xl bg-white/20 backdrop-blur-md mx-auto transform -rotate-6 shadow-2xl border border-white/40"></div>
        <div class="absolute top-2 right-2 w-12 h-12 bg-yellow-400 rounded-full"></div>
        <div class="absolute bottom-2 left-2 w-8 h-8 bg-pink-400 rounded-full"></div>
      </div>
      <h1 class="text-7xl font-black mb-6 text-white drop-shadow-2xl">
        @{{username}}
      </h1>
      <p class="text-2xl text-white/95 max-w-2xl mx-auto font-medium">{{bio}}</p>
    </div>

    <!-- Colorful Links -->
    <div class="grid md:grid-cols-2 gap-4 mb-12">
      {{socialLinks}}
    </div>

    <!-- Content Cards -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Fun Footer -->
  <footer class="relative z-10 backdrop-blur-xl bg-black/30 border-t border-white/20 py-10 mt-16">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <div class="flex items-center justify-center gap-2 mb-4">
        <span class="text-3xl">✨</span>
        <p class="text-white text-lg font-bold">@{{username}}</p>
        <span class="text-3xl">✨</span>
      </div>
      <p class="text-white/70 text-sm">
        Made with 💖 using <span class="font-bold text-white">Neropage</span>
      </p>
    </div>
  </footer>
</div>

<style>
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-30px); }
}
.animate-gradient-shift {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>`
  },
  {
    name: 'Interactive 3D Card Stack',
    description: 'Premium 3D effect with interactive hover animations and depth',
    preview: '🎭',
    color: 'from-violet-600 to-cyan-600',
    code: `<!-- 3D Card Stack Premium -->
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
  <!-- Animated Background Elements -->
  <div class="absolute inset-0">
    <div class="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl opacity-50"></div>
    <div class="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl opacity-50"></div>
  </div>

  <div class="relative z-10 max-w-6xl mx-auto px-6 py-20">
    <!-- Premium Header -->
    <div class="text-center mb-20">
      <div class="relative inline-block mb-8">
        <div class="absolute -inset-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl opacity-25 blur-2xl"></div>
        <div class="relative w-48 h-48 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 shadow-2xl transform hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          <span class="text-7xl font-black text-white">@</span>
        </div>
      </div>
      <h1 class="text-6xl md:text-7xl font-black mt-8 mb-4 bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">@{{username}}</h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto mb-4">{{bio}}</p>
      <p class="text-sm text-gray-400 font-mono">🚀 Premium Profile • Neropage v2.0</p>
    </div>

    <!-- About & Business Section -->
    <div class="grid md:grid-cols-2 gap-6 mb-12">
      {{aboutMe ? \`<div class="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-8 hover:border-violet-500/50 transition-colors">
        <h3 class="text-xl font-bold text-violet-400 mb-4">📝 About Me</h3>
        <p class="text-gray-300 leading-relaxed">{{aboutMe}}</p>
      </div>\` : ''}}
      {{businessInfo ? \`<div class="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors">
        <h3 class="text-xl font-bold text-cyan-400 mb-4">💼 Business</h3>
        <p class="text-gray-300 leading-relaxed whitespace-pre-line">{{businessInfo}}</p>
      </div>\` : ''}}
    </div>

    <!-- Premium Links Grid -->
    <div class="mb-12">
      <h2 class="text-3xl font-bold text-center mb-8 text-white">Connect With Me</h2>
      <div class="grid md:grid-cols-3 gap-4">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content Showcase -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Premium Footer -->
  <footer class="relative z-10 border-t border-white/10 bg-gradient-to-t from-black via-slate-900/50 to-transparent py-12 mt-20">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">N</span>
          <p class="text-gray-400">Powered by Neropage</p>
        </div>
        <p class="text-gray-500 text-sm">© 2024 @{{username}} • Premium Edition</p>
      </div>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Bold & Vibrant Web3',
    description: 'Modern Web3 aesthetic with crypto vibes and bold typography',
    preview: '🔥',
    color: 'from-orange-500 via-pink-500 to-rose-500',
    code: `<!-- Web3 Crypto Premium -->
<div class="min-h-screen bg-black relative overflow-hidden">
  <!-- Animated Grid Background -->
  <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 1px); background-size: 50px 50px;"></div>
  
  <!-- Glowing Orbs -->
  <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
  <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>

  <div class="relative z-10 max-w-6xl mx-auto px-6 py-20">
    <!-- Bold Typography Header -->
    <div class="text-center mb-20">
      <div class="mb-8">
        <div class="inline-block">
          <span class="text-9xl font-black tracking-tighter" style="background: linear-gradient(135deg, #FF6B35, #FF006E, #FFB703); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">@{{username}}</span>
        </div>
      </div>
      <p class="text-2xl text-gray-300 max-w-3xl mx-auto font-semibold mb-4">{{bio}}</p>
      <div class="flex items-center justify-center gap-3 mb-8">
        <div class="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        <span class="text-lg font-bold text-transparent bg-gradient-to-r from-orange-400 via-pink-400 to-rose-400 bg-clip-text">ONLINE • ACTIVE</span>
        <div class="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
      </div>
    </div>

    <!-- Info Sections -->
    <div class="grid md:grid-cols-2 gap-6 mb-16">
      {{aboutMe ? \`<div class="border-2 border-orange-500/50 rounded-xl p-8 bg-gradient-to-br from-orange-500/10 to-transparent">
        <h3 class="text-2xl font-black text-orange-400 mb-3 uppercase tracking-wide">About</h3>
        <p class="text-gray-300 leading-relaxed">{{aboutMe}}</p>
      </div>\` : ''}}
      {{businessInfo ? \`<div class="border-2 border-pink-500/50 rounded-xl p-8 bg-gradient-to-br from-pink-500/10 to-transparent">
        <h3 class="text-2xl font-black text-pink-400 mb-3 uppercase tracking-wide">Services</h3>
        <p class="text-gray-300 leading-relaxed whitespace-pre-line">{{businessInfo}}</p>
      </div>\` : ''}}
    </div>

    <!-- Bold CTA Links -->
    <div class="mb-16">
      <h2 class="text-5xl font-black text-center mb-10 text-white uppercase tracking-tighter">Join My Network</h2>
      <div class="grid md:grid-cols-2 gap-4">
        {{socialLinks}}
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-6">
      {{contentBlocks}}
    </div>
  </div>

  <!-- Bold Footer -->
  <footer class="relative z-10 border-t-2 border-orange-500/30 bg-gradient-to-t from-black to-transparent py-12 mt-20">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h3 class="text-3xl font-black mb-2 text-transparent bg-gradient-to-r from-orange-400 via-pink-400 to-rose-400 bg-clip-text">NEROPAGE PREMIUM</h3>
      <p class="text-gray-500">© 2024 @{{username}} • Web3 Edition</p>
    </div>
  </footer>
</div>`
  },
  {
    name: 'Minimalist Sidebar',
    description: 'Executive-style sidebar layout with professional navigation',
    preview: '💼',
    color: 'from-slate-600 to-slate-700',
    code: `<!-- Executive Sidebar Layout -->
<div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex">
  <!-- Sidebar -->
  <div class="w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 p-8 flex flex-col">
    <!-- Profile Section -->
    <div class="mb-12">
      <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-6 shadow-lg border-4 border-slate-700"></div>
      <h1 class="text-3xl font-bold text-center text-white">@{{username}}</h1>
      <p class="text-center text-gray-400 mt-2 text-sm">Professional</p>
    </div>

    <!-- About Card -->
    {{aboutMe ? \`<div class="mb-8 pb-8 border-b border-slate-700">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About</h3>
      <p class="text-sm text-gray-300 leading-relaxed">{{aboutMe}}</p>
    </div>\` : ''}}

    <!-- Business Info -->
    {{businessInfo ? \`<div class="mb-8 pb-8 border-b border-slate-700">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Services</h3>
      <p class="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{{businessInfo}}</p>
    </div>\` : ''}}

    <!-- Links Section -->
    <div class="flex-1">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Connect</h3>
      <div class="space-y-2">
        {{socialLinks}}
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 p-12 overflow-auto">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="mb-16">
        <h2 class="text-6xl font-bold mb-4 text-white">Welcome</h2>
        <p class="text-xl text-gray-400 leading-relaxed">{{bio}}</p>
      </div>

      <!-- Content Blocks -->
      <div class="space-y-8">
        {{contentBlocks}}
      </div>
    </div>
  </div>
</div>`
  }
];

const QUICK_CODE_SNIPPETS = [
  {
    name: 'Basic Profile Card',
    code: `<div class="text-center p-8">
  <div class="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600"></div>
  <h1 class="text-4xl font-bold mb-2">@{{username}}</h1>
  <p class="text-gray-400 mb-8">{{bio}}</p>
  <div class="space-y-2">{{socialLinks}}</div>
</div>`
  },
  {
    name: 'Animated Header',
    code: `<header class="min-h-screen flex items-center justify-center">
  <style>
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    .float { animation: float 3s ease-in-out infinite; }
  </style>
  <div class="text-center">
    <h1 class="text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">@{{username}}</h1>
    <p class="text-xl text-gray-300 mb-12">{{bio}}</p>
    <div class="space-y-3 max-w-md mx-auto">{{socialLinks}}</div>
  </div>
</header>`
  },
  {
    name: 'Two Column Layout',
    code: `<div class="grid grid-cols-2 gap-8 p-8 max-w-6xl mx-auto">
  <div>
    <h2 class="text-3xl font-bold mb-4">About {{username}}</h2>
    <p class="text-gray-300 leading-relaxed mb-6">{{aboutMe}}</p>
    <div class="bg-blue-500/10 p-4 rounded-lg">{{businessInfo}}</div>
  </div>
  <div>
    <h2 class="text-3xl font-bold mb-6">Connect</h2>
    <div class="space-y-3">{{socialLinks}}</div>
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
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Use these variables in your HTML template. They'll be automatically replaced with your profile information. <strong>Copy any variable and paste it into your code.</strong>
            </AlertDescription>
          </Alert>

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
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Ready-Made Code Snippets</h3>
            <p className="text-sm text-muted-foreground">
              Click "Copy & Use" to add these snippets to your template. Customize them as needed!
            </p>
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
                <pre className="bg-black/50 p-3 rounded text-xs overflow-x-auto font-mono text-green-400">
                  {snippet.code.substring(0, 150)}...
                </pre>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => copyToClipboard(snippet.code, `snippet-${index}`)}
                  >
                    {copied === `snippet-${index}` ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Code
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
                    Use Template
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