import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialLinkButton } from "@/components/SocialLinkButton";
import { NeropageLogo } from "@/components/NeropageLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, TrendingUp, Zap } from "lucide-react";
import type { Profile, SocialLink } from "@shared/schema";
import { useMemo, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function PublicProfile() {
  const [, params] = useRoute("/user/:username");
  const username = params?.username;

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles", username],
    enabled: !!username,
  });

  const { data: links = [], isLoading: linksLoading } = useQuery<SocialLink[]>({
    queryKey: ["/api/profiles", username, "links"],
    enabled: !!username && !!profile,
  });

  const isLoading = profileLoading || linksLoading;

  const sortedLinks = useMemo(() => 
    [...links].sort((a, b) => a.order - b.order),
    [links]
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

  const totalConnections = sortedLinks.length;

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

  useEffect(() => {
    if (profile) {
      trackViewMutation.mutate();
    }
  }, [profile?.id]);

  const handleLinkClick = (linkId: string) => {
    trackClickMutation.mutate(linkId);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <div className="pt-16 pb-12 text-center space-y-6">
            <Skeleton className="w-32 h-32 rounded-full mx-auto" />
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-20 w-32 rounded-xl" />
              <Skeleton className="h-20 w-32 rounded-xl" />
              <Skeleton className="h-20 w-32 rounded-xl" />
            </div>
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="pt-16 pb-8 text-center animate-fade-in" data-testid="profile-header">
          {/* Profile Avatar with Glow Effect */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse-slow" />
            <Avatar className="relative w-32 h-32 border-4 border-background shadow-2xl">
              <AvatarImage src={profile.avatar} alt={profile.username} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-cyan-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Status Indicator */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-400 border-4 border-background rounded-full shadow-lg animate-pulse" />
          </div>

          {/* Username and Badge */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-cyan-500 to-purple-500 bg-clip-text text-transparent" data-testid="text-username">
              @{profile.username}
            </h1>
            <Badge className="px-3 py-1 bg-gradient-to-r from-primary/20 to-cyan-500/20 border-primary/40 neon-glow">
              <Zap className="w-3 h-3 mr-1" />
              PRO
            </Badge>
          </div>

          {profile.bio && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-6 mb-6 leading-relaxed" data-testid="text-bio">
              {profile.bio}
            </p>
          )}

          {/* Elegant Separator */}
          <div className="max-w-md mx-auto mb-12 relative">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-background">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Connect With Me
                </span>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Links Section with Advanced Grid */}
        <div className="pb-12" data-testid="links-container">
          {linksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : sortedLinks.length === 0 ? (
            <Card className="p-12 text-center max-w-2xl mx-auto glass-card neon-glow border-2 border-dashed relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500 rounded-full blur-3xl animate-float-delayed" />
              </div>
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg mb-6">
                  <Globe className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Platforms Yet</h3>
                <p className="text-muted-foreground">
                  This user hasn't connected any platforms yet
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Featured Link (First one) */}
              {sortedLinks[0] && (
                <div className="mb-6 animate-fade-in">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Featured Platform
                  </div>
                  <SocialLinkButton
                    platformId={sortedLinks[0].platform}
                    url={sortedLinks[0].url}
                    customTitle={sortedLinks[0].customTitle}
                    onClick={() => handleLinkClick(sortedLinks[0].id)}
                  />
                </div>
              )}

              {/* Other Links in Grid */}
              {sortedLinks.length > 1 && (
                <>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold flex items-center gap-2 mt-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    All Connections
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedLinks.slice(1).map((link, index) => (
                      <div
                        key={link.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <SocialLinkButton
                          platformId={link.platform}
                          url={link.url}
                          customTitle={link.customTitle}
                          onClick={() => handleLinkClick(link.id)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
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
                  background: 'linear-gradient(135deg, #8B5CF6, #06B6D4, #EC4899, #8B5CF6)',
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
                Enterprise Link Platform
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>Powered by Advanced Analytics</span>
            <span>•</span>
            <span>Real-time Updates</span>
            <span>•</span>
            <span>Secured Connection</span>
          </div>
        </footer>
      </div>
    </div>
  );
}