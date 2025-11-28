import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialLinkButton } from "@/components/SocialLinkButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Mail, Share2, CheckCircle2, TrendingUp, Zap, Award, Clock, Users, Eye } from "lucide-react";
import type { Profile, SocialLink, ContentBlock } from "@shared/schema";
import { useMemo, useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";

const THEME_BACKGROUNDS: Record<string, string> = {
  "d7cacdd5-42a7-4535-a5fd-9bd214c4825b": "linear-gradient(135deg, #0d1b2a 0%, #1a3a52 100%)",
  "cfc2c9a7-38a6-4738-a838-4fb22b7132c6": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)",
  "a8f5e2b1-7c3d-4f9e-b2a1-5d8c6e9f2a1b": "linear-gradient(135deg, #8B0000 0%, #DC143C 25%, #FF1493 50%, #DC143C 75%, #8B0000 100%)",
  "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c": "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
  "e2d4c5a6-b7c8-9a0b-1c2d-3e4f5a6b7c8d": "linear-gradient(to bottom, #001a4d 0%, #0a0e27 50%, #050508 100%)",
  "c3b2a1d0-e9f8-7a6b-5c4d-3e2f1a0b9c8d": "linear-gradient(135deg, #0a0e27 0%, #1a0033 50%, #0a0e27 100%)",
  "g1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c": "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)",
  "h2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d": "linear-gradient(45deg, #0a0014 0%, #1a0033 25%, #2d0052 50%, #1a0033 75%, #0a0014 100%)",
  "i3c4d5e6-f7g8-9h0i-1j2k-3l4m5n6o7p8q": "radial-gradient(circle at 20% 50%, rgba(100, 200, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(100, 150, 255, 0.1) 0%, transparent 40%), linear-gradient(to bottom, #0a0e2e 0%, #0f1b3c 20%, #1a2847 40%, #0d1426 60%, #050508 100%)",
};

export default function PublicProfile() {
  const [, params] = useRoute("/user/:username");
  const username = params?.username || "";
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
  });

  const { data: contentBlocks = [] } = useQuery<ContentBlock[]>({
    queryKey: ["/api/profiles", username, "content-blocks"],
    enabled: !!username && !!profile,
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
      toast({ title: "Message sent!", description: "Thank you for your submission." });
      setEmailFormData({ name: "", email: "", message: "" });
    },
  });

  useEffect(() => {
    if (profile) trackViewMutation.mutate();
  }, [profile?.id]);


  const handleLinkClick = (linkId: string) => {
    trackClickMutation.mutate(linkId);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFormMutation.mutate(emailFormData);
  };

  // Get top performing links
  const topLinks = useMemo(() => {
    return [...sortedLinks]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 3);
  }, [sortedLinks]);

  // Get link groups
  const getGroupedLinks = (groupId?: string) => {
    return sortedLinks.filter(link => link.groupId === groupId);
  };

  // Mock testimonials (in real app, would fetch from database)
  const testimonials = [
    { name: "Sarah M.", text: "This link page converted better than my old one!", avatar: "SM" },
    { name: "Alex R.", text: "Love the clean design and animations!", avatar: "AR" },
    { name: "Jordan L.", text: "Best Linktree alternative I've found.", avatar: "JL" },
  ];

  const sanitizeCSS = (css: string): string => {
    let sanitized = css;
    sanitized = sanitized.replace(/<\s*\/?\s*style[^>]*>/gi, '');
    sanitized = sanitized.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    sanitized = sanitized.replace(/<[^>]+>/g, '');
    return sanitized;
  };

  if (profileLoading) {
    return <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black" />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 bg-gray-800/50 border-gray-700">
          <Globe className="w-8 h-8 text-red-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
          <p className="text-gray-400">This profile doesn't exist or has been removed.</p>
        </Card>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/user/${profile.username}`;
  const pageTitle = profile.seoTitle || `${profile.username} - Link Hub`;
  const pageDescription = profile.seoDescription || profile.bio || `Check out all of ${profile.username}'s social media links`;
  const ogImage = profile.ogImage || profile.avatar || `${window.location.origin}/default-og-image.png`;


  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="author" content={profile.username} />
        <link rel="canonical" href={profileUrl} />
        
        {/* Open Graph Tags for Social Sharing */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={profileUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Neropage" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      {/* Full Screen Background Container */}
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }}>
        {profile.backgroundType === "image" && profile.backgroundImage ? (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${profile.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }}
          />
        ) : profile.backgroundType === "video" && profile.backgroundVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={profile.backgroundVideo} type="video/mp4" />
          </video>
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: profile.backgroundColor || (profile?.appliedTemplateId ? THEME_BACKGROUNDS[profile.appliedTemplateId as keyof typeof THEME_BACKGROUNDS] : null) || "linear-gradient(180deg, #0f0f1a 0%, #0a0a0f 50%, #050508 100%)",
            }}
          />
        )}
      </div>

      <div 
        className="min-h-screen relative pb-12"
        style={{
          zIndex: 10,
          fontFamily: profile.fontFamily || "DM Sans",
          color: profile.textColor || "#E5E7EB",
        }}
      >
        {/* Cover Photo - Inside content div so it displays properly */}
        {profile.coverPhoto && profile.backgroundType !== "video" && (
          <div
            className="w-full h-40 sm:h-48 md:h-56 bg-cover bg-center -mx-4 sm:-mx-6"
            style={{
              backgroundImage: `url(${profile.coverPhoto})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        <div 
          className="max-w-md mx-auto px-4 space-y-8 pt-12 sm:pt-16 md:pt-20"
        >
        {profile.customCSS && (
          <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(profile.customCSS) }} />
        )}
          
          {/* Profile Header - Centered */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Avatar */}
            <motion.div 
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="absolute -inset-3 rounded-full blur-2xl"
                style={{ background: profile.primaryColor || "#8B5CF6" }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-gray-900 shadow-2xl relative">
                <AvatarImage src={profile.avatar || undefined} alt={profile.username} />
                <AvatarFallback 
                  className="text-3xl sm:text-4xl font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${profile.primaryColor || "#8B5CF6"}, ${profile.primaryColor || "#8B5CF6"}99)` }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Username & Verification */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black" style={{ color: profile.textColor || "#E5E7EB" }}>
                  {profile.username}
                </h1>
                {profile.verificationBadge && (
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity }}>
                    <CheckCircle2 className="w-5 h-5" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                  </motion.div>
                )}
              </div>
              <p className="text-sm" style={{ color: profile.textColor ? `${profile.textColor}99` : "#9CA3AF" }}>@{profile.username}</p>
            </motion.div>

            {/* Bio */}
            {profile.bio && (
              <motion.p 
                className="text-sm sm:text-base leading-relaxed" 
                style={{ color: profile.textColor || "#E5E7EB" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {profile.bio}
              </motion.p>
            )}

            {/* Share Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-white gap-2 mx-auto"
                onClick={() => {
                  navigator.clipboard.writeText(profileUrl);
                  toast({ title: "Link copied!" });
                }}
              >
                <Share2 className="w-4 h-4" />
                Copy Link
              </Button>
            </motion.div>

            {/* Premium Badge */}
            {profile.verificationBadge && (
              <motion.div 
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full w-fit mx-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">Pro Member</span>
              </motion.div>
            )}
          </motion.div>

          {/* Content Blocks */}
          {sortedBlocks.length > 0 && (
            <div className="space-y-4">
              {sortedBlocks.map((block) => (
                <div key={block.id} className="bg-gray-900/80 rounded-xl border border-gray-800/50 p-4 sm:p-6">
                  {block.type === "video" && block.mediaUrl && (
                    <div>
                      {block.title && <h3 className="text-lg font-bold mb-3" style={{ color: profile.textColor || "#E5E7EB" }}>{block.title}</h3>}
                      <div className="aspect-video rounded-lg overflow-hidden border border-gray-700/50 bg-black">
                        {(() => {
                          const url = block.mediaUrl;
                          // YouTube detection
                          if (url.includes("youtube.com") || url.includes("youtu.be")) {
                            const videoId = url.includes("youtu.be")
                              ? url.split("youtu.be/")[1]?.split("?")[0]
                              : url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)?.[1];
                            return (
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            );
                          }
                          // Vimeo detection
                          if (url.includes("vimeo.com")) {
                            const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
                            return (
                              <iframe
                                src={`https://player.vimeo.com/video/${videoId}`}
                                className="w-full h-full"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                              />
                            );
                          }
                          // TikTok detection
                          if (url.includes("tiktok.com") || url.includes("vm.tiktok.com") || url.includes("vt.tiktok.com")) {
                            return (
                              <iframe
                                src={`https://www.tiktok.com/embed/v2/${url.split("/video/")[1]?.split("?")[0] || url.split("/")[3]}`}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media"
                                style={{ minHeight: "500px" }}
                              />
                            );
                          }
                          // Instagram detection (posts and reels)
                          if (url.includes("instagram.com") || url.includes("instagr.am")) {
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-gray-950">
                                <iframe
                                  src={`https://www.instagram.com/p/${url.split("/p/")[1]?.split("/")[0] || url.split("/reel/")[1]?.split("/")[0]}/embed`}
                                  className="w-full"
                                  style={{ maxWidth: "540px", minHeight: "500px" }}
                                  allowFullScreen
                                />
                              </div>
                            );
                          }
                          // Facebook detection (videos and posts)
                          if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com")) {
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-gray-950">
                                <div style={{ minHeight: "500px" }} className="w-full">
                                  <iframe
                                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=500&show_text=false`}
                                    style={{ border: "none", overflow: "hidden", width: "100%", minHeight: "500px" }}
                                    scrolling="no"
                                    frameBorder="0"
                                    allowFullScreen={true}
                                  />
                                </div>
                              </div>
                            );
                          }
                          // HTML5 video player for direct video links
                          return (
                            <video 
                              controls 
                              controlsList="nodownload"
                              className="w-full h-full"
                              style={{ objectFit: "cover" }}
                            >
                              <source src={url} type="video/mp4" />
                              <source src={url} type="video/webm" />
                              <source src={url} type="video/ogg" />
                              Your browser does not support the video tag.
                            </video>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {block.type === "image" && block.mediaUrl && (
                    <div>
                      {block.title && <h3 className="text-lg font-bold mb-3" style={{ color: profile.textColor || "#E5E7EB" }}>{block.title}</h3>}
                      <img src={block.mediaUrl} alt={block.title || "Content"} className="w-full rounded-lg border border-gray-700/50" />
                    </div>
                  )}

                  {block.type === "text" && block.content && (
                    <div>
                      {block.title && <h3 className="text-lg font-bold mb-3" style={{ color: profile.textColor || "#E5E7EB" }}>{block.title}</h3>}
                      <div className="text-gray-300 text-sm leading-relaxed space-y-3">
                        {block.content.split("\n\n").map((paragraph, idx) => (
                          <p key={idx} className="whitespace-pre-wrap">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === "form" && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                        <Mail className="w-5 h-5" style={{ color: profile.primaryColor || "#8B5CF6" }} />
                        {block.title || "Get in Touch"}
                      </h3>
                      <form onSubmit={handleFormSubmit} className="space-y-3">
                        <Input
                          placeholder="Your Name"
                          value={emailFormData.name}
                          onChange={(e) => setEmailFormData({ ...emailFormData, name: e.target.value })}
                          required
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                        <Input
                          type="email"
                          placeholder="Your Email"
                          value={emailFormData.email}
                          onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                          required
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                        <Input
                          placeholder="Your Message"
                          value={emailFormData.message}
                          onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                          required
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                        <Button
                          type="submit"
                          disabled={submitFormMutation.isPending}
                          className="w-full text-white rounded-lg"
                          style={{ backgroundColor: profile.primaryColor || "#8B5CF6" }}
                        >
                          {submitFormMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </div>
                  )}

                  {block.type === "embed" && block.content && (
                    <div>
                      {block.title && <h3 className="text-lg font-bold mb-3" style={{ color: profile.textColor || "#E5E7EB" }}>{block.title}</h3>}
                      <div 
                        className="embed-container rounded-lg border border-gray-700/50 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content) }}
                      />
                    </div>
                  )}

                  {block.type === "gallery" && block.content && (
                    <div>
                      {block.title && <h3 className="text-lg font-bold mb-3" style={{ color: profile.textColor || "#E5E7EB" }}>{block.title}</h3>}
                      <div className="grid grid-cols-2 gap-3">
                        {block.content.split("\n").filter(url => url.trim()).map((imageUrl, idx) => (
                          <img 
                            key={idx}
                            src={imageUrl.trim()} 
                            alt={`Gallery ${idx + 1}`} 
                            className="w-full rounded-lg border border-gray-700/50 hover:border-primary/50 transition-colors"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Links Section */}
          {sortedLinks.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-8 h-8 mx-auto mb-2" style={{ color: profile.primaryColor || "#8B5CF6" }} />
              <p className="text-gray-400 text-sm">No links added yet</p>
            </div>
          ) : (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {sortedLinks.map((link, index) => {
                const now = new Date();
                const isScheduled = link.isScheduled && link.scheduleStart && link.scheduleEnd;
                const scheduleStart = link.scheduleStart ? new Date(link.scheduleStart) : null;
                const scheduleEnd = link.scheduleEnd ? new Date(link.scheduleEnd) : null;
                const isActive = !isScheduled || (scheduleStart && scheduleEnd && now >= scheduleStart && now <= scheduleEnd);

                if (!isActive) return null;

                return (
                  <motion.div 
                    key={link.id} 
                    className="group relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    whileHover={{ x: 4 }}
                  >
                    <div 
                      className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-30 blur-sm transition-opacity"
                      style={{ background: profile.primaryColor || "#8B5CF6" }}
                    />
                    <div className="relative">
                      {link.badge && link.badge !== "none" && (
                        <motion.div 
                          className="mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 + 0.1 }}
                        >
                          <Badge className="text-[10px] font-bold uppercase px-2 py-0.5 text-white" style={{ background: profile.primaryColor || "#8B5CF6" }}>
                            {link.badge}
                          </Badge>
                        </motion.div>
                      )}
                      <SocialLinkButton
                        platformId={link.platform}
                        url={link.url}
                        customTitle={link.customTitle}
                        onClick={() => handleLinkClick(link.id)}
                      />
                      {link.description && (
                        <motion.p 
                          className="text-xs text-gray-400 mt-1 px-4 pb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 + 0.15 }}
                        >
                          {link.description}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* About & Business Info */}
          {(profile.aboutMe || profile.businessInfo) && (
            <div className="space-y-3 text-center text-sm">
              {profile.aboutMe && <p className="text-gray-300">{profile.aboutMe}</p>}
              {profile.businessInfo && <p className="text-gray-400">{profile.businessInfo}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
