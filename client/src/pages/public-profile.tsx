import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialLinkButton } from "@/components/SocialLinkButton";
import { NeropageLogo } from "@/components/NeropageLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Zap, Play, Mail } from "lucide-react";
import type { Profile, SocialLink, ContentBlock } from "@shared/schema";
import { useMemo, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { SocialProofWidget } from "@/components/SocialProofWidget";
import { LiveVisitorCounter } from "@/components/LiveVisitorCounter";
import DOMPurify from "dompurify";
import { getPlatform } from "@/lib/platforms";

export default function PublicProfile() {
  const [, params] = useRoute("/user/:username");
  const username = params?.username || "";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [emailFormData, setEmailFormData] = useState({ name: "", email: "", message: "" });

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles", username],
    enabled: !!username,
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  });

  const { data: links = [], isLoading: linksLoading } = useQuery<SocialLink[]>({
    queryKey: ["/api/profiles", username, "links"],
    enabled: !!username && !!profile,
    refetchInterval: 3000,
  });

  const { data: contentBlocks = [] } = useQuery<ContentBlock[]>({
    queryKey: ["/api/profiles", username, "content-blocks"],
    enabled: !!username && !!profile,
    refetchInterval: 3000,
  });

  const isLoading = profileLoading || linksLoading;

  const sortedLinks = useMemo(() => 
    [...links].sort((a, b) => a.order - b.order),
    [links]
  );

  const sortedBlocks = useMemo(() => 
    [...contentBlocks].sort((a, b) => a.order - b.order),
    [contentBlocks]
  );

  const initials = useMemo(() => 
    (profile?.username || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    [profile?.username]
  );

  const trackViewMutation = useMutation({
    mutationFn: async () => {
      if (!username) return;
      return await apiRequest("POST", `/api/profiles/${username}/view`, {});
    },
  });

  const trackClickMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return await apiRequest("POST", `/api/links/${linkId}/click`, {});
    },
  });

  const submitFormMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      if (!username) return;
      return await apiRequest("POST", `/api/profiles/${username}/form-submit`, data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for your submission.",
      });
      setEmailFormData({ name: "", email: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (profile) {
      trackViewMutation.mutate();
    }
  }, [profile?.id]);

  const handleLinkClick = (linkId: string) => {
    trackClickMutation.mutate(linkId);
  };

  const handleFormSubmit = (e: React.FormEvent, blockId: string) => {
    e.preventDefault();
    submitFormMutation.mutate(emailFormData);
  };

  // Helper function to escape HTML
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Helper function to sanitize CSS
  const sanitizeCSS = (css: string): string => {
    // For maximum security, we prevent breaking out of <style> tag
    // and filter dangerous CSS patterns
    let sanitized = css;

    // Prevent </style> tag injection and other HTML tag injections
    sanitized = sanitized.replace(/<\s*\/?\s*style[^>]*>/gi, '');
    sanitized = sanitized.replace(/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis, '');
    sanitized = sanitized.replace(/<[^>]+>/g, ''); // Remove any remaining HTML tags

    // Remove all at-rules (@import, @font-face, @keyframes, etc.) except @media
    sanitized = sanitized.replace(/@(?!media)[a-z-]+\s*[^{;]*[{;]/gi, '');

    // Remove any URL references (to prevent data:, javascript:, and external resource loading)
    sanitized = sanitized.replace(/url\s*\([^)]*\)/gi, '');

    // Remove expression() and other IE-specific hacks
    sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');
    sanitized = sanitized.replace(/-moz-binding\s*:/gi, '');

    // Remove behavior property (IE)
    sanitized = sanitized.replace(/behavior\s*:/gi, '');

    // Remove any javascript: or vbscript: protocol references
    sanitized = sanitized.replace(/(javascript|vbscript|data):/gi, '');

    return sanitized;
  };

  // Render custom template with placeholders replaced
  const renderCustomTemplate = () => {
    if (!profile || !profile.useCustomTemplate || !profile.templateHTML) {
      return null;
    }

    let html = profile.templateHTML;

    // Replace basic placeholders with escaped values
    html = html.replace(/\{\{username\}\}/g, escapeHtml(profile.username));
    html = html.replace(/\{\{bio\}\}/g, escapeHtml(profile.bio || ""));
    html = html.replace(/\{\{avatar\}\}/g, escapeHtml(profile.avatar || ""));

    // Generate social links HTML with escaped values
    const socialLinksHTML = sortedLinks
      .map(
        (link) => `
        <a 
          href="${escapeHtml(link.url)}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="social-link"
          data-platform="${escapeHtml(link.platform)}"
        >
          ${escapeHtml(link.customTitle || link.platform)}
        </a>
      `
      )
      .join("");
    html = html.replace(/\{\{socialLinks\}\}/g, socialLinksHTML);

    // Generate content blocks HTML with escaped values
    const contentBlocksHTML = sortedBlocks
      .map((block) => {
        if (block.type === "text" && block.content) {
          return `<div class="content-block content-block-text">
            ${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ""}
            <p>${escapeHtml(block.content)}</p>
          </div>`;
        }
        if (block.type === "image" && block.mediaUrl) {
          return `<div class="content-block content-block-image">
            ${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ""}
            <img src="${escapeHtml(block.mediaUrl)}" alt="${escapeHtml(block.title || "Content")}" />
          </div>`;
        }
        if (block.type === "video" && block.mediaUrl) {
          return `<div class="content-block content-block-video">
            ${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ""}
            <iframe src="${escapeHtml(block.mediaUrl.replace("watch?v=", "embed/"))}" frameborder="0" allowfullscreen></iframe>
          </div>`;
        }
        return "";
      })
      .join("");
    html = html.replace(/\{\{contentBlocks\}\}/g, contentBlocksHTML);

    // Sanitize the final HTML using DOMPurify to prevent XSS
    // Block iframes entirely and use strict URL validation
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a', 'ul', 'ol', 'li', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'target', 'rel', 'data-platform'],
      ALLOW_DATA_ATTR: false,
      // Only allow http, https, and relative URLs - block data:, javascript:, etc.
      ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|\/|#)/i,
    });
  };

  // Get background style based on customization
  const getBackgroundStyle = () => {
    if (!profile) return {};

    const baseStyle: React.CSSProperties = {
      backgroundColor: profile.backgroundColor || "#0A0A0F",
      position: "relative",
    };

    if (profile.backgroundType === "image" && profile.backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${profile.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      };
    }

    if (profile.backgroundType === "gradient") {
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${profile.backgroundColor || "#0A0A0F"}, ${profile.primaryColor || "#8B5CF6"}, ${profile.backgroundColor || "#0A0A0F"})`,
        backgroundSize: "200% 200%",
        animation: "gradient-shift 15s ease infinite",
      };
    }

    return baseStyle;
  };

  // Get button class based on button style
  const getButtonClass = () => {
    if (!profile) return "";

    switch (profile.buttonStyle) {
      case "pill":
        return "rounded-full";
      case "square":
        return "rounded-none";
      default:
        return "rounded-lg";
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <div className="pt-16 pb-12 text-center space-y-6">
            <Skeleton className="w-32 h-32 rounded-full mx-auto" />
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 neon-glow glass-card">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-2xl flex items-center justify-center">
            <Globe className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="text-muted-foreground">
            This profile doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/user/${profile.username}`;
  const pageTitle = profile.seoTitle || `${profile.username} - Link Hub`;
  const pageDescription = profile.seoDescription || profile.bio || `Check out all of ${profile.username}'s social media links and content`;
  const siteName = window.location.hostname.replace('www.', '');
  const ogImage = profile.ogImage || profile.avatar || `${window.location.origin}/favicon.png`;
  const ogImageAlt = profile.ogImage ? `${profile.username}'s profile image` : profile.avatar ? `${profile.username}'s avatar` : "Neropage Logo";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="author" content={profile.username} />
        <meta name="keywords" content={`${profile.username}, social links, bio link, ${profile.username} links, contact ${profile.username}`} />
        <link rel="canonical" href={profileUrl} />

        <meta property="og:type" content="profile" />
        <meta property="og:url" content={profileUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={ogImageAlt} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={profileUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
      </Helmet>

      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          ...getBackgroundStyle(),
          fontFamily: profile.fontFamily || "DM Sans",
          color: profile.primaryColor ? `${profile.primaryColor}22` : undefined,
        }}
      >
        {/* Background Video if set */}
        {profile.backgroundType === "video" && profile.backgroundVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="fixed inset-0 w-full h-full object-cover -z-10 opacity-30"
          >
            <source src={profile.backgroundVideo} type="video/mp4" />
          </video>
        )}

        {/* Dark overlay for better text readability */}
        {(profile.backgroundType === "image" || profile.backgroundType === "video") && (
          <div className="fixed inset-0 bg-black/40 -z-5" />
        )}

        {/* Custom CSS */}
        {profile.customCSS && (
          <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(profile.customCSS) }} />
        )}

        {/* Profile Content */}
        {profile.useCustomTemplate && profile.templateHTML ? (
          <div 
            className="min-h-screen"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(
                profile.templateHTML
                  .replace(/\{\{username\}\}/g, escapeHtml(profile.username || ''))
                  .replace(/\{\{bio\}\}/g, escapeHtml(profile.bio || ''))
                  .replace(/\{\{avatar\}\}/g, escapeHtml(profile.avatar || ''))
                  .replace(/\{\{primaryColor\}\}/g, escapeHtml(profile.primaryColor || '#8B5CF6'))
                  .replace(/\{\{backgroundColor\}\}/g, escapeHtml(profile.backgroundColor || '#0a0a0a'))
                  .replace(/\{\{fontFamily\}\}/g, escapeHtml(profile.fontFamily || 'DM Sans'))
                  .replace(/\{\{socialLinks\}\}/g, sortedLinks.length > 0 ? sortedLinks.map(link => {
                    const platform = getPlatform(link.platform);
                    const icon = platform ? platform.name.charAt(0) : '🔗';
                    return `
                      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" 
                         class="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 group">
                        <span class="font-semibold">${icon} ${escapeHtml(link.customTitle || link.platform)}</span>
                      </a>
                    `;
                  }).join('') : '<p class="text-gray-400 text-center">No links added yet</p>')
                  .replace(/\{\{contentBlocks\}\}/g, sortedBlocks.length > 0 ? sortedBlocks.map(block => `
                    <div class="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <h3 class="font-bold mb-2">${escapeHtml(block.title || 'Content Block')}</h3>
                      <div class="text-sm text-gray-300">${escapeHtml(block.content || '')}</div>
                    </div>
                  `).join('') : ''),
                {
                  ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a', 'ul', 'ol', 'li', 'br', 'strong', 'em', 'u', 'header', 'footer', 'section', 'article', 'main', 'nav'],
                  ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'target', 'rel', 'style'],
                  ALLOW_DATA_ATTR: false,
                  ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|\/|#)/i,
                }
              )
            }}
          />
        ) : (
          /* Beautiful Default Layout */
          <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
            {/* Enhanced Hero Section */}
            <div className="pt-16 pb-10 text-center animate-fade-in" data-testid="profile-header">
              {/* Animated Background Elements */}
              <div className="absolute top-10 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl opacity-60 animate-pulse-slow" />
              <div className="absolute top-32 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

              {/* Main Profile Card */}
              <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-[2rem] p-12 mb-10 shadow-2xl max-w-3xl mx-auto hover:shadow-[0_0_80px_rgba(139,92,246,0.3)] transition-all duration-500">
                {/* Animated Border Gradient */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-cyan-500/50 opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                {/* Profile Avatar with Enhanced Glow */}
                <div className="relative inline-block mb-8">
                  <div 
                    className="absolute -inset-4 rounded-full blur-3xl opacity-70 animate-pulse-slow"
                    style={{
                      background: `radial-gradient(circle, ${profile.primaryColor || "#8B5CF6"}, transparent 70%)`,
                    }}
                  />
                  <Avatar className="relative w-40 h-40 border-[6px] border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.3)] ring-4 ring-white/10">
                    <AvatarImage src={profile.avatar || undefined} alt={profile.username} />
                    <AvatarFallback 
                      className="text-5xl font-black text-white"
                      style={{ 
                        background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}, ${profile.primaryColor || "#8B5CF6"}99)`,
                      }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online Status Indicator */}
                  <div className="absolute bottom-4 right-4 flex items-center justify-center">
                    <div className="w-10 h-10 bg-emerald-400 border-[5px] border-white/60 rounded-full shadow-xl">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                    </div>
                  </div>
                </div>

                {/* Username with Premium Styling */}
                <div className="mb-8 space-y-4">
                  <h1 
                    className="text-6xl md:text-7xl font-black mb-4 tracking-tight leading-none"
                    style={{ 
                      background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"} 0%, #ffffff 50%, ${profile.primaryColor || "#8B5CF6"} 100%)`,
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      animation: 'shimmer 3s linear infinite',
                    }}
                    data-testid="text-username"
                  >
                    @{profile.username}
                  </h1>
                  
                  {/* Decorative Line with Badge */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-white/40 to-white/40 rounded-full" />
                    <Badge 
                      className="px-5 py-2 text-sm font-bold backdrop-blur-md shadow-lg hover:scale-105 transition-transform"
                      style={{
                        background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}40, ${profile.primaryColor || "#8B5CF6"}60)`,
                        borderColor: `${profile.primaryColor || "#8B5CF6"}`,
                        borderWidth: '2px',
                        color: 'white',
                      }}
                    >
                      <Zap className="w-4 h-4 mr-1.5 animate-pulse" />
                      PRO MEMBER
                    </Badge>
                    <div className="h-[2px] w-20 bg-gradient-to-l from-transparent via-white/40 to-white/40 rounded-full" />
                  </div>
                </div>

                {/* Bio Section */}
                {profile.bio && (
                  <div className="max-w-2xl mx-auto mb-8">
                    <p className="text-2xl leading-relaxed text-white/95 font-medium tracking-wide" data-testid="text-bio">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Live Stats Row */}
                <div className="flex justify-center items-center gap-6 pt-6 border-t border-white/10">
                  <LiveVisitorCounter username={profile.username} />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-white/70 font-medium">Available</span>
                  </div>
                </div>
              </div>
            </div>

          {/* Content Blocks with Glass Design */}
          {sortedBlocks.length > 0 && (
            <div className="pb-8 space-y-6 max-w-3xl mx-auto">
              {sortedBlocks.map((block) => (
                <div key={block.id} className="animate-fade-in">
                  {block.type === "video" && block.mediaUrl && (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                      {block.title && <h3 className="text-xl font-bold mb-4 text-white">{block.title}</h3>}
                      <div className="aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
                        <iframe
                          src={block.mediaUrl.replace("watch?v=", "embed/")}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "image" && block.mediaUrl && (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                      {block.title && <h3 className="text-xl font-bold mb-4 text-white">{block.title}</h3>}
                      <img 
                        src={block.mediaUrl} 
                        alt={block.title || "Content"} 
                        className="w-full rounded-xl border border-white/10"
                      />
                    </div>
                  )}

                  {block.type === "gallery" && block.content && (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                      {block.title && <h3 className="text-xl font-bold mb-4 text-white">{block.title}</h3>}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {block.content.split("\n").filter(url => url.trim()).map((url, idx) => (
                          <img 
                            key={idx}
                            src={url.trim()} 
                            alt={`Gallery ${idx + 1}`} 
                            className="w-full aspect-square object-cover rounded-xl border border-white/10"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === "text" && block.content && (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                      {block.title && <h3 className="text-xl font-bold mb-4 text-white">{block.title}</h3>}
                      <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{block.content}</p>
                    </div>
                  )}

                  {block.type === "embed" && block.content && (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                      {block.title && <h3 className="text-xl font-bold mb-4 text-white">{block.title}</h3>}
                      <div dangerouslySetInnerHTML={{ __html: block.content }} />
                    </div>
                  )}

                  {block.type === "form" && (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Mail className="w-6 h-6 text-white" />
                        <h3 className="text-xl font-bold text-white">{block.title || "Get in Touch"}</h3>
                      </div>
                      <form onSubmit={(e) => handleFormSubmit(e, block.id)} className="space-y-4">
                        <Input
                          placeholder="Your Name"
                          value={emailFormData.name}
                          onChange={(e) => setEmailFormData({ ...emailFormData, name: e.target.value })}
                          required
                          data-testid="input-form-name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                        <Input
                          type="email"
                          placeholder="Your Email"
                          value={emailFormData.email}
                          onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                          required
                          data-testid="input-form-email"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                        <Input
                          placeholder="Your Message"
                          value={emailFormData.message}
                          onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                          required
                          data-testid="input-form-message"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                        <Button
                          type="submit"
                          disabled={submitFormMutation.isPending}
                          className={`w-full ${getButtonClass()}`}
                          style={{
                            backgroundColor: profile.primaryColor || "#8B5CF6",
                            color: "#FFFFFF",
                          }}
                        >
                          {submitFormMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Links Section */}
          <div className="pb-20" data-testid="links-container">
            {sortedLinks.length === 0 ? (
              <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-dashed border-white/30 rounded-[2rem] p-16 text-center max-w-2xl mx-auto shadow-2xl">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl">
                  <Globe className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <h3 className="text-3xl font-bold mb-3 text-white">No Links Yet</h3>
                <p className="text-lg text-white/70">
                  This user hasn't added any links to their profile
                </p>
              </div>
            ) : (
              <div className={`space-y-5 max-w-3xl mx-auto ${profile.layout === "grid" ? "md:grid md:grid-cols-2 md:gap-5 md:space-y-0" : ""}`}>
                {sortedLinks.map((link, index) => {
                  // Check if link is scheduled
                  const now = new Date();
                  const isScheduled = link.isScheduled && link.scheduleStart && link.scheduleEnd;
                  const scheduleStart = link.scheduleStart ? new Date(link.scheduleStart) : null;
                  const scheduleEnd = link.scheduleEnd ? new Date(link.scheduleEnd) : null;
                  const isActive = !isScheduled || (scheduleStart && scheduleEnd && now >= scheduleStart && now <= scheduleEnd);

                  if (!isActive) return null;

                  return (
                    <div
                      key={link.id}
                      className="group animate-fade-in relative backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 border-2 border-white/20 hover:border-white/50 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                      style={{ 
                        animationDelay: `${index * 80}ms`,
                      }}
                    >
                      {/* Glow Effect on Hover */}
                      <div 
                        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 -z-10"
                        style={{
                          background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}60, transparent)`,
                        }}
                      />
                      
                      {link.badge && link.badge !== "none" && (
                        <div className="absolute -top-3 -right-3 z-10 animate-bounce-slow">
                          <Badge className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white border-0 shadow-2xl px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                            {link.badge}
                          </Badge>
                        </div>
                      )}
                      
                      <SocialLinkButton
                        platformId={link.platform}
                        url={link.url}
                        customTitle={link.customTitle}
                        onClick={() => handleLinkClick(link.id)}
                      />
                      
                      {link.description && (
                        <p className="text-sm text-white/80 mt-3 px-6 pb-4 leading-relaxed">
                          {link.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Premium Footer */}
          <footer className="relative z-10 backdrop-blur-2xl bg-gradient-to-t from-black/50 to-black/30 border-t-2 border-white/20 py-16 mt-24">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center space-y-6">
                {/* Logo and Brand */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <NeropageLogo size={48} />
                  <div className="text-left">
                    <div
                      className="text-2xl font-black select-none tracking-tight"
                      style={{
                        background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}, #06B6D4, #EC4899, ${profile.primaryColor || "#8B5CF6"})`,
                        backgroundSize: '300% 300%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        animation: 'shimmer 3s linear infinite',
                      }}
                    >
                      Neropage
                    </div>
                    <div className="text-xs text-white/70 font-semibold tracking-wider uppercase">
                      Premium Bio Platform
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center gap-4 my-6">
                  <div className="h-px w-24 bg-gradient-to-r from-transparent to-white/30" />
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <div className="h-px w-24 bg-gradient-to-l from-transparent to-white/30" />
                </div>

                {/* Copyright */}
                <p className="text-white/60 text-sm font-medium">
                  © 2024 <span className="text-white/90 font-bold">@{profile.username}</span> • Crafted with <span className="text-pink-400">♥</span> on Neropage
                </p>
                
                {/* Tagline */}
                <p className="text-white/40 text-xs italic">
                  One link to rule them all ✨
                </p>
              </div>
            </div>
          </footer>
          </div>
        )}
      </div>
    </>
  );
}