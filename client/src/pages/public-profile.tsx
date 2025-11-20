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

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="author" content={profile.username} />
        <meta name="keywords" content={`${profile.username}, social links, bio link, ${profile.username} links, contact ${profile.username}`} />
        <link rel="canonical" href={profileUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={profileUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content="Neropage" />
        {profile.ogImage && <meta property="og:image" content={profile.ogImage} />}
        {profile.ogImage && <meta property="og:image:alt" content={`${profile.username}'s profile image`} />}
        {profile.avatarUrl && !profile.ogImage && <meta property="og:image" content={profile.avatarUrl} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={profileUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {profile.ogImage && <meta name="twitter:image" content={profile.ogImage} />}
        {profile.avatarUrl && !profile.ogImage && <meta name="twitter:image" content={profile.avatarUrl} />}
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={profileUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        {profile.ogImage && <meta property="twitter:image" content={profile.ogImage} />}
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
          <style dangerouslySetInnerHTML={{ __html: profile.customCSS }} />
        )}

        <div className={`max-w-4xl mx-auto px-4 relative z-10 ${profile.layout === "minimal" ? "max-w-2xl" : ""}`}>
          {/* Hero Section */}
          <div className="pt-16 pb-8 text-center animate-fade-in" data-testid="profile-header">
            {/* Profile Avatar */}
            <div className="relative inline-block mb-6">
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse-slow"
                style={{
                  background: `linear-gradient(to right, ${profile.primaryColor || "#8B5CF6"}, ${profile.backgroundColor || "#0A0A0F"})`,
                }}
              />
              <Avatar className="relative w-32 h-32 border-4 border-background shadow-2xl">
                <AvatarImage src={profile.avatar || undefined} alt={profile.username} />
                <AvatarFallback 
                  className="text-3xl font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}, ${profile.backgroundColor || "#0A0A0F"})` }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-400 border-4 border-background rounded-full shadow-lg animate-pulse" />
            </div>

            {/* Username and Badge */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 
                className="text-4xl font-black"
                style={{ 
                  background: `linear-gradient(to right, ${profile.primaryColor || "#8B5CF6"}, ${profile.backgroundColor || "#0A0A0F"})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
                data-testid="text-username"
              >
                @{profile.username}
              </h1>
              <Badge 
                className="px-3 py-1 neon-glow"
                style={{
                  backgroundColor: `${profile.primaryColor || "#8B5CF6"}20`,
                  borderColor: `${profile.primaryColor || "#8B5CF6"}40`,
                }}
              >
                <Zap className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            </div>

            {profile.bio && (
              <p className="text-lg max-w-2xl mx-auto px-6 mb-6 leading-relaxed text-foreground" data-testid="text-bio">
                {profile.bio}
              </p>
            )}

            {/* Live Visitor Counter */}
            <div className="flex justify-center mb-6">
              <LiveVisitorCounter username={profile.username} />
            </div>

            {/* Separator */}
            <div className="max-w-md mx-auto mb-12 relative">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          </div>

          {/* Content Blocks */}
          {sortedBlocks.length > 0 && (
            <div className="pb-8 space-y-6">
              {sortedBlocks.map((block) => (
                <div key={block.id} className="animate-fade-in">
                  {block.type === "video" && block.mediaUrl && (
                    <Card className="p-6 glass-card neon-glow overflow-hidden">
                      {block.title && <h3 className="text-xl font-bold mb-4">{block.title}</h3>}
                      <div className="aspect-video rounded-lg overflow-hidden bg-black/20">
                        <iframe
                          src={block.mediaUrl.replace("watch?v=", "embed/")}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </Card>
                  )}

                  {block.type === "image" && block.mediaUrl && (
                    <Card className="p-6 glass-card neon-glow overflow-hidden">
                      {block.title && <h3 className="text-xl font-bold mb-4">{block.title}</h3>}
                      <img 
                        src={block.mediaUrl} 
                        alt={block.title || "Content"} 
                        className="w-full rounded-lg"
                      />
                    </Card>
                  )}

                  {block.type === "gallery" && block.content && (
                    <Card className="p-6 glass-card neon-glow">
                      {block.title && <h3 className="text-xl font-bold mb-4">{block.title}</h3>}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {block.content.split("\n").filter(url => url.trim()).map((url, idx) => (
                          <img 
                            key={idx}
                            src={url.trim()} 
                            alt={`Gallery ${idx + 1}`} 
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </Card>
                  )}

                  {block.type === "text" && block.content && (
                    <Card className="p-6 glass-card neon-glow">
                      {block.title && <h3 className="text-xl font-bold mb-4">{block.title}</h3>}
                      <p className="text-foreground whitespace-pre-wrap">{block.content}</p>
                    </Card>
                  )}

                  {block.type === "embed" && block.content && (
                    <Card className="p-6 glass-card neon-glow overflow-hidden">
                      {block.title && <h3 className="text-xl font-bold mb-4">{block.title}</h3>}
                      <div dangerouslySetInnerHTML={{ __html: block.content }} />
                    </Card>
                  )}

                  {block.type === "form" && (
                    <Card className="p-6 glass-card neon-glow">
                      <div className="flex items-center gap-3 mb-4">
                        <Mail className="w-6 h-6" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                        <h3 className="text-xl font-bold">{block.title || "Get in Touch"}</h3>
                      </div>
                      <form onSubmit={(e) => handleFormSubmit(e, block.id)} className="space-y-4">
                        <Input
                          placeholder="Your Name"
                          value={emailFormData.name}
                          onChange={(e) => setEmailFormData({ ...emailFormData, name: e.target.value })}
                          required
                          data-testid="input-form-name"
                        />
                        <Input
                          type="email"
                          placeholder="Your Email"
                          value={emailFormData.email}
                          onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                          required
                          data-testid="input-form-email"
                        />
                        <Input
                          placeholder="Your Message"
                          value={emailFormData.message}
                          onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                          required
                          data-testid="input-form-message"
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
                    </Card>
                  )}

                  {(block.type === "music" || block.type === "podcast") && block.mediaUrl && (
                    <Card className="p-6 glass-card neon-glow overflow-hidden">
                      {block.title && <h3 className="text-xl font-bold mb-4">{block.title}</h3>}
                      <div className="aspect-video rounded-lg overflow-hidden bg-black/20">
                        <iframe
                          src={block.mediaUrl}
                          className="w-full h-full"
                          allow="encrypted-media"
                          allowFullScreen
                        />
                      </div>
                    </Card>
                  )}

                  {block.type === "testimonial" && block.content && (
                    <Card className="p-6 glass-card neon-glow">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl text-primary/30">"</div>
                        <div className="flex-1">
                          {block.title && <p className="font-semibold mb-2">{block.title}</p>}
                          <p className="text-foreground italic mb-3">{block.content}</p>
                          {block.mediaUrl && (
                            <div className="flex items-center gap-3">
                              <img 
                                src={block.mediaUrl} 
                                alt="Author" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}

                  {block.type === "faq" && block.content && (
                    <Card className="p-6 glass-card neon-glow">
                      {block.title && <h3 className="text-xl font-bold mb-4">{block.title}</h3>}
                      <div className="space-y-4">
                        {block.content.split("\n\n").map((qa, idx) => {
                          const [question, answer] = qa.split("\n");
                          return (
                            <div key={idx} className="border-b border-border/30 pb-4 last:border-0">
                              <p className="font-semibold mb-2">{question}</p>
                              <p className="text-sm text-muted-foreground">{answer}</p>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Links Section */}
          <div className="pb-12" data-testid="links-container">
            {sortedLinks.length === 0 ? (
              <Card className="p-12 text-center max-w-2xl mx-auto glass-card neon-glow border-2 border-dashed">
                <Globe className="w-10 h-10 mx-auto mb-4" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                <h3 className="text-xl font-bold mb-2">No Platforms Yet</h3>
                <p className="text-muted-foreground">
                  This user hasn't connected any platforms yet
                </p>
              </Card>
            ) : (
              <div className={`space-y-4 max-w-3xl mx-auto ${profile.layout === "grid" ? "md:grid md:grid-cols-2 md:gap-4 md:space-y-0" : ""}`}>
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
                      className="animate-fade-in relative"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {link.badge && link.badge !== "none" && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg">
                            {link.badge.toUpperCase()}
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
                        <p className="text-xs text-muted-foreground mt-2 px-4">
                          {link.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="py-12 text-center border-t border-border/50 mt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <NeropageLogo size={40} />
              <div className="text-left">
                <div
                  className="text-lg font-bold select-none"
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
                <div className="text-xs text-muted-foreground font-medium">
                  Premium Link Platform
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}