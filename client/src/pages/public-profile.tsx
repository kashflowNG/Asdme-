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
import { Globe, Zap, Mail, MapPin, Calendar, Users, Eye, Share2, CheckCircle2, Camera } from "lucide-react";
import type { Profile, SocialLink, ContentBlock } from "@shared/schema";
import { useMemo, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { LiveVisitorCounter } from "@/components/LiveVisitorCounter";
import DOMPurify from "dompurify";
import { getPlatform } from "@/lib/platforms";

const THEME_BACKGROUNDS: Record<string, string> = {
  "d7cacdd5-42a7-4535-a5fd-9bd214c4825b": "linear-gradient(135deg, #0d1b2a 0%, #1a3a52 100%)", // Christmas
  "cfc2c9a7-38a6-4738-a838-4fb22b7132c6": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)", // New Year
};

export default function PublicProfile() {
  const [, params] = useRoute("/user/:username");
  const username = params?.username || "";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [emailFormData, setEmailFormData] = useState({ name: "", email: "", message: "" });

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles", username],
    enabled: !!username,
    refetchInterval: 3000,
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

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const sanitizeCSS = (css: string): string => {
    let sanitized = css;
    sanitized = sanitized.replace(/<\s*\/?\s*style[^>]*>/gi, '');
    sanitized = sanitized.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    sanitized = sanitized.replace(/<[^>]+>/g, '');
    sanitized = sanitized.replace(/@(?!media)[a-z-]+\s*[^{;]*[{;]/gi, '');
    sanitized = sanitized.replace(/url\s*\([^)]*\)/gi, '');
    sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');
    sanitized = sanitized.replace(/-moz-binding\s*:/gi, '');
    sanitized = sanitized.replace(/behavior\s*:/gi, '');
    sanitized = sanitized.replace(/(javascript|vbscript|data):/gi, '');
    return sanitized;
  };

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
        <div className="h-[280px] md:h-[350px] bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 -mt-20">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="w-40 h-40 rounded-full border-4 border-gray-900" />
            <div className="flex-1 pt-4 space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 bg-gray-800/50 border-gray-700 backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl flex items-center justify-center">
            <Globe className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
          <p className="text-gray-400">
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

  const defaultCoverGradient = `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}40 0%, ${profile.primaryColor || "#8B5CF6"}20 25%, #1a1a2e 50%, ${profile.primaryColor || "#8B5CF6"}20 75%, ${profile.primaryColor || "#8B5CF6"}40 100%)`;
  
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
        
        <script src="https://cdn.tailwindcss.com"></script>
      </Helmet>

      <div 
        className="min-h-screen"
        style={{
          background: (profile?.appliedTemplateId && THEME_BACKGROUNDS[profile.appliedTemplateId as keyof typeof THEME_BACKGROUNDS]) 
            ? THEME_BACKGROUNDS[profile.appliedTemplateId as keyof typeof THEME_BACKGROUNDS]
            : "linear-gradient(180deg, #0f0f1a 0%, #0a0a0f 50%, #050508 100%)",
          fontFamily: profile.fontFamily || "DM Sans",
        }}
      >
        {profile.backgroundType === "video" && profile.backgroundVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="fixed inset-0 w-full h-full object-cover -z-10 opacity-20"
          >
            <source src={profile.backgroundVideo} type="video/mp4" />
          </video>
        )}

        {profile.customCSS && (
          <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(profile.customCSS) }} />
        )}

        <>
            {/* Cover Photo Section - Facebook Style */}
            <div className="relative">
              {/* Cover Photo */}
              <div 
                className="h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] w-full relative overflow-hidden"
                style={{
                  background: profile.coverPhoto 
                    ? `url(${profile.coverPhoto})` 
                    : defaultCoverGradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                
                {/* Decorative Elements */}
                {!profile.coverPhoto && (
                  <>
                    <div 
                      className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-40"
                      style={{ background: profile.primaryColor || "#8B5CF6" }}
                    />
                    <div 
                      className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full blur-[80px] opacity-30"
                      style={{ background: `${profile.primaryColor || "#8B5CF6"}80` }}
                    />
                  </>
                )}
              </div>

              {/* Profile Header Card - Overlapping Cover */}
              <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
                <div className="relative -mt-24 sm:-mt-28 md:-mt-32">
                  {/* Main Profile Card */}
                  <div className="bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-950/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden">
                    
                    {/* Top Section with Avatar and Info */}
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                        
                        {/* Avatar Container */}
                        <div className="relative shrink-0 -mt-16 sm:-mt-20 md:-mt-24">
                          <div className="relative">
                            {/* Glow Effect */}
                            <div 
                              className="absolute -inset-2 rounded-full blur-xl opacity-60"
                              style={{ background: profile.primaryColor || "#8B5CF6" }}
                            />
                            {/* Avatar */}
                            <Avatar className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 border-4 sm:border-[6px] border-gray-900 shadow-2xl ring-2 ring-gray-700/50 relative">
                              <AvatarImage src={profile.avatar || undefined} alt={profile.username} className="object-cover" />
                              <AvatarFallback 
                                className="text-3xl sm:text-4xl md:text-5xl font-black text-white"
                                style={{ 
                                  background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}, ${profile.primaryColor || "#8B5CF6"}99)`,
                                }}
                              >
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Online Indicator */}
                            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
                              <div className="relative">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 border-[3px] border-gray-900 rounded-full shadow-lg shadow-emerald-500/50" />
                                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-50" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h1 
                              className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight truncate"
                              data-testid="text-username"
                            >
                              {profile.username}
                            </h1>
                            
                            {/* Verification Badge */}
                            {profile.verificationBadge && (
                              <div 
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                                style={{ 
                                  background: `${profile.primaryColor || "#8B5CF6"}30`,
                                  color: profile.primaryColor || "#8B5CF6",
                                  border: `1px solid ${profile.primaryColor || "#8B5CF6"}50`
                                }}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verified
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm sm:text-base">@{profile.username}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-white gap-2"
                            onClick={() => {
                              navigator.clipboard.writeText(profileUrl);
                              toast({ title: "Link copied!", description: "Profile link copied to clipboard" });
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Share</span>
                          </Button>
                          <Button
                            size="sm"
                            className="gap-2 text-white"
                            style={{ background: profile.primaryColor || "#8B5CF6" }}
                          >
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Follow</span>
                          </Button>
                        </div>
                      </div>

                      {/* Bio Section */}
                      {profile.bio && (
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-800/50">
                          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl" data-testid="text-bio">
                            {profile.bio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="border-t border-gray-800/50 bg-gray-900/30">
                      <div className="flex items-center justify-center md:justify-start gap-0 overflow-x-auto">
                        <button 
                          className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-white relative shrink-0"
                          style={{ color: profile.primaryColor || "#8B5CF6" }}
                        >
                          Links
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full"
                            style={{ background: profile.primaryColor || "#8B5CF6" }}
                          />
                        </button>
                        {sortedBlocks.length > 0 && (
                          <button className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-400 hover:text-white transition-colors shrink-0">
                            Content
                          </button>
                        )}
                        <button className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-400 hover:text-white transition-colors shrink-0">
                          About
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Left Sidebar - About & Stats */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                  {/* About Card */}
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                      About
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {profile.bio && (
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                          <p className="text-gray-400">Creator & Digital Enthusiast</p>
                        </div>
                      )}
                      <div className="flex items-start gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-gray-400">Joined Neropage</p>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Globe className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                        <a 
                          href={profileUrl} 
                          className="text-gray-400 hover:underline truncate"
                          style={{ color: profile.primaryColor || "#8B5CF6" }}
                        >
                          {profileUrl.replace('https://', '').replace('http://', '')}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* About & Business Info */}
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                      Business
                    </h3>
                    <div className="space-y-4">
                      {profile.aboutMe && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">About</p>
                          <p className="text-sm text-gray-300 leading-relaxed">{profile.aboutMe}</p>
                        </div>
                      )}
                      {profile.businessInfo && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">Business</p>
                          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.businessInfo}</p>
                        </div>
                      )}
                      {!profile.aboutMe && !profile.businessInfo && (
                        <p className="text-sm text-gray-400 italic">No business information added yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content - Links & Content Blocks */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Content Blocks */}
                  {sortedBlocks.length > 0 && (
                    <div className="space-y-4">
                      {sortedBlocks.map((block) => (
                        <div key={block.id} className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50 overflow-hidden">
                          {block.type === "video" && block.mediaUrl && (
                            <div className="p-4 sm:p-6">
                              {block.title && <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">{block.title}</h3>}
                              <div className="aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black/40 border border-gray-700/50">
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
                            <div className="p-4 sm:p-6">
                              {block.title && <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">{block.title}</h3>}
                              <img 
                                src={block.mediaUrl} 
                                alt={block.title || "Content"} 
                                className="w-full rounded-lg sm:rounded-xl border border-gray-700/50"
                              />
                            </div>
                          )}

                          {block.type === "gallery" && block.content && (
                            <div className="p-4 sm:p-6">
                              {block.title && <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">{block.title}</h3>}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                                {block.content.split("\n").filter(url => url.trim()).map((url, idx) => (
                                  <img 
                                    key={idx}
                                    src={url.trim()} 
                                    alt={`Gallery ${idx + 1}`} 
                                    className="w-full aspect-square object-cover rounded-lg sm:rounded-xl border border-gray-700/50"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {block.type === "text" && block.content && (
                            <div className="p-4 sm:p-6">
                              {block.title && <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">{block.title}</h3>}
                              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{block.content}</p>
                            </div>
                          )}

                          {block.type === "form" && (
                            <div className="p-4 sm:p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <Mail className="w-5 sm:w-6 h-5 sm:h-6" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                                <h3 className="text-lg sm:text-xl font-bold text-white">{block.title || "Get in Touch"}</h3>
                              </div>
                              <form onSubmit={(e) => handleFormSubmit(e, block.id)} className="space-y-3 sm:space-y-4">
                                <Input
                                  placeholder="Your Name"
                                  value={emailFormData.name}
                                  onChange={(e) => setEmailFormData({ ...emailFormData, name: e.target.value })}
                                  required
                                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                                />
                                <Input
                                  type="email"
                                  placeholder="Your Email"
                                  value={emailFormData.email}
                                  onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                                  required
                                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                                />
                                <Input
                                  placeholder="Your Message"
                                  value={emailFormData.message}
                                  onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                                  required
                                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                                />
                                <Button
                                  type="submit"
                                  disabled={submitFormMutation.isPending}
                                  className={`w-full ${getButtonClass()} text-white`}
                                  style={{ backgroundColor: profile.primaryColor || "#8B5CF6" }}
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

                  {/* Links Section */}
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                      <Globe className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                      My Links
                    </h3>
                    
                    {sortedLinks.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div 
                          className="w-14 sm:w-16 h-14 sm:h-16 mx-auto mb-4 rounded-xl sm:rounded-2xl flex items-center justify-center"
                          style={{ background: `${profile.primaryColor || "#8B5CF6"}20` }}
                        >
                          <Globe className="w-7 sm:w-8 h-7 sm:h-8" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2">No Links Yet</h4>
                        <p className="text-gray-400 text-sm">This user hasn't added any links</p>
                      </div>
                    ) : (
                      <div className={`space-y-3 ${profile.layout === "grid" ? "md:grid md:grid-cols-2 md:gap-3 md:space-y-0" : ""}`}>
                        {sortedLinks.map((link, index) => {
                          const now = new Date();
                          const isScheduled = link.isScheduled && link.scheduleStart && link.scheduleEnd;
                          const scheduleStart = link.scheduleStart ? new Date(link.scheduleStart) : null;
                          const scheduleEnd = link.scheduleEnd ? new Date(link.scheduleEnd) : null;
                          const isActive = !isScheduled || (scheduleStart && scheduleEnd && now >= scheduleStart && now <= scheduleEnd);

                          if (!isActive) return null;

                          return (
                            <div
                              key={link.id}
                              className="group relative bg-gradient-to-r from-gray-800/50 to-gray-800/30 hover:from-gray-700/60 hover:to-gray-700/40 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all duration-300 hover:shadow-lg"
                              style={{ 
                                animationDelay: `${index * 50}ms`,
                              }}
                            >
                              {/* Glow on Hover */}
                              <div 
                                className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 -z-10"
                                style={{ background: profile.primaryColor || "#8B5CF6" }}
                              />
                              
                              {link.badge && link.badge !== "none" && (
                                <div className="absolute -top-2 -right-2 z-10">
                                  <Badge 
                                    className="text-[10px] font-bold uppercase px-2 py-0.5 text-white border-0 shadow-lg"
                                    style={{ background: profile.primaryColor || "#8B5CF6" }}
                                  >
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
                                <p className="text-xs sm:text-sm text-gray-400 mt-2 px-4 pb-3 leading-relaxed">
                                  {link.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            {!profile.hideBranding && (
              <footer className="border-t border-gray-800/50 bg-gray-950/50 backdrop-blur-xl py-6 sm:py-8 mt-8 sm:mt-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <NeropageLogo size={28} />
                      <div>
                        <div 
                          className="text-lg sm:text-xl font-black"
                          style={{
                            background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}, #06B6D4)`,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                          }}
                        >
                          Neropage
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
                      © {new Date().getFullYear()} @{profile.username} • Powered by Neropage
                    </p>
                  </div>
                </div>
              </footer>
            )}
          </>
      </div>
    </>
  );
}
