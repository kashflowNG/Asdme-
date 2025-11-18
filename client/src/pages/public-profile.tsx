import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { SocialLinkButton } from "@/components/SocialLinkButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { Profile, SocialLink } from "@shared/schema";

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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4">
          <div className="pt-12 pb-8 text-center space-y-4">
            <Skeleton className="w-24 h-24 rounded-full mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-3 pb-16">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="text-muted-foreground">
            This profile doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  const initials = profile.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-8 text-center" data-testid="profile-header">
          <Avatar className="w-24 h-24 mx-auto border-4 border-border">
            <AvatarImage src={profile.avatar} alt={profile.username} />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-bold" data-testid="text-username">
            @{profile.username}
          </h1>
          {profile.bio && (
            <p className="mt-2 text-base text-muted-foreground max-w-sm mx-auto px-6" data-testid="text-bio">
              {profile.bio}
            </p>
          )}
        </div>

        <div className="space-y-3 pb-8" data-testid="links-container">
          {linksLoading ? (
            <>
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </>
          ) : sortedLinks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No links added yet</p>
            </Card>
          ) : (
            sortedLinks.map((link) => (
              <SocialLinkButton
                key={link.id}
                platform={link.platform}
                url={link.url}
              />
            ))
          )}
        </div>

        <footer className="py-8 text-center border-t mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">LN</span>
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Powered by LinkNero
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Enterprise Link Management Platform
          </p>
        </footer>
      </div>
    </div>
  );
}
