import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { NeropageLogo } from "@/components/NeropageLogo";
import { getPlatform } from "@/lib/platforms";
import { GripVertical, Trash2, Plus, Eye, Upload, Copy, Check, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Profile, SocialLink } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocation } from "wouter";

interface SortableLinkItemProps {
  link: SocialLink;
  onDelete: (id: string) => void;
}

function SortableLinkItem({ link, onDelete }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const platform = getPlatform(link.platform);
  if (!platform) return null;

  const Icon = platform.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-card-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all"
      data-testid={`link-item-${link.platform}`}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors"
        {...attributes}
        {...listeners}
        data-testid={`drag-handle-${link.platform}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Icon className="w-6 h-6 flex-shrink-0" style={{ color: platform.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{platform.name}</p>
        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(link.id)}
        className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
        data-testid={`button-delete-${link.platform}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    bio: "",
    avatar: "",
  });

  // Track the last committed profile to prevent stale comparisons
  const lastCommittedProfile = useRef<Profile | null>(null);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profiles/me"],
    staleTime: 0,
  });

  const { data: links = [] } = useQuery<SocialLink[]>({
    queryKey: ["/api/links"],
    staleTime: 0,
  });

  // Hydrate form state and update committed ref from fetched profile
  // Only sync when profile changes from what we last committed
  useEffect(() => {
    if (profile && profile.id !== lastCommittedProfile.current?.id) {
      const profileData = {
        username: profile.username,
        bio: profile.bio || "",
        avatar: profile.avatar || "",
      };
      setProfileForm(profileData);
      lastCommittedProfile.current = profile;
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username?: string; bio?: string; avatar?: string }) => {
      return await apiRequest("PATCH", "/api/profiles/me", data);
    },
    onSuccess: (updatedProfile: Profile) => {
      // Update cache and committed ref only
      // Do NOT reset form state to allow in-flight edits
      queryClient.setQueryData(["/api/profiles/me"], updatedProfile);
      lastCommittedProfile.current = updatedProfile;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      // Reset form to last committed profile on error
      if (lastCommittedProfile.current) {
        setProfileForm({
          username: lastCommittedProfile.current.username,
          bio: lastCommittedProfile.current.bio || "",
          avatar: lastCommittedProfile.current.avatar || "",
        });
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("Profile not found");

      return await apiRequest("PATCH", `/api/profiles/${profile.id}`, profileForm);
    },
    onSuccess: () => {
      toast({
        title: "Profile saved",
        description: "Your changes have been saved successfully",
      });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: { platform: string; url: string; customTitle?: string }) => {
      return await apiRequest("POST", "/api/links", {
        platform: data.platform,
        url: data.url,
        customTitle: data.customTitle,
        order: links.length,
      });
    },
    onSuccess: () => {
      toast({
        title: "Link added",
        description: "Your social link has been added successfully",
      });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add link",
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/links/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link removed",
        description: "Your social link has been removed.",
      });
    },
  });

  const reorderLinksMutation = useMutation({
    mutationFn: async (reorderedLinks: SocialLink[]) => {
      return await apiRequest("POST", "/api/links/reorder", {
        links: reorderedLinks.map((link, index) => ({
          id: link.id,
          order: index,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const sortedLinks = [...links].sort((a, b) => a.order - b.order);
      const oldIndex = sortedLinks.findIndex((link) => link.id === active.id);
      const newIndex = sortedLinks.findIndex((link) => link.id === over.id);

      const reordered = arrayMove(sortedLinks, oldIndex, newIndex);
      reorderLinksMutation.mutate(reordered);
    }
  };

  const handleUpdateProfile = (field: "username" | "bio" | "avatar") => {
    const value = profileForm[field];

    // Don't update if profile hasn't loaded yet
    if (!lastCommittedProfile.current) {
      return;
    }

    // Get the last committed value for this field
    const committedValue = (lastCommittedProfile.current[field] || "") as string;

    // Don't update if value is unchanged from last committed
    if (value === committedValue) {
      return;
    }

    // Don't allow empty username
    if (field === "username" && value.trim() === "") {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      // Reset to committed value
      setProfileForm({ ...profileForm, username: committedValue });
      return;
    }

    updateProfileMutation.mutate({ [field]: value });
  };

  const handleAddLink = (platform: string, url: string, customTitle?: string) => {
    createLinkMutation.mutate({ platform, url, customTitle });
  };

  const handleSaveProfile = () => {
    saveProfileMutation.mutate();
  };

  const handleCopyLink = async () => {
    if (!profile) return;
    
    const url = `${window.location.origin}/user/${profile.username}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Your profile link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const initials = (profile?.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-16 px-4 border-b border-glow-animate bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-2xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NeropageLogo size={32} />
            <h1
              className="text-xl font-bold select-none"
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
            </h1>
          </div>
          {profile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/user/${profile.username}`)}
              data-testid="button-preview"
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-profile-editor">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Profile Configuration</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-primary/20 to-cyan-500/20 text-primary rounded-lg font-semibold border border-primary/30 shadow-sm">
                PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={profile?.avatar || profileForm.avatar} alt={profile?.username} />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar" className="text-sm font-medium">Avatar URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="avatar"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  onBlur={() => handleUpdateProfile("avatar")}
                  disabled={!profile}
                  data-testid="input-avatar"
                />
                <Button size="icon" variant="outline" data-testid="button-upload-avatar">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">@</span>
              <Input
                id="username"
                type="text"
                placeholder="yourname"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                onBlur={() => handleUpdateProfile("username")}
                disabled={!profile}
                data-testid="input-username"
              />
            </div>
          </div>

          {profile && (
            <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-cyan-500/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Your Profile Link</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`/user/${profile.username}`, '_blank')}
                    className="h-8 gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-8 gap-2"
                    data-testid="button-copy-link"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-background/80 rounded-lg border border-border/50 font-mono text-sm break-all">
                {window.location.origin}/user/{profile.username}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell people about yourself..."
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              onBlur={() => handleUpdateProfile("bio")}
              disabled={!profile}
              className="min-h-24 resize-none"
              data-testid="input-bio"
            />
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saveProfileMutation.isPending}
            className="w-full h-12 text-base font-semibold gradient-shimmer hover-neon-glow"
            data-testid="button-save-profile"
          >
            {saveProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Card>

        <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-links-manager">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">Platform Links</h2>
                <span className="text-xs px-2.5 py-1 bg-muted/50 text-muted-foreground rounded-md font-medium border border-border/50">
                  {sortedLinks.length} Connected
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Manage your digital presence across 25+ platforms</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            disabled={!profile}
            data-testid="button-add-link"
            className="w-full h-12 text-base font-semibold gradient-shimmer hover-neon-glow"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Platform Link
          </Button>

          {sortedLinks.length === 0 ? (
            <div className="relative text-center py-16 space-y-4 bg-gradient-to-b from-primary/5 to-transparent rounded-xl border-2 border-dashed overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 w-32 h-32 bg-primary rounded-full blur-3xl" />
                <div className="absolute bottom-4 right-4 w-32 h-32 bg-cyan-500 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="mt-6">
                  <p className="text-lg font-semibold">No platforms connected yet</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                    Connect your social platforms to create a unified digital presence
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedLinks.map((link) => link.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedLinks.map((link) => (
                    <SortableLinkItem
                      key={link.id}
                      link={link}
                      onDelete={deleteLinkMutation.mutate}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </Card>
      </main>

      <AddLinkDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddLink}
        existingPlatforms={links.map((link) => link.platform)}
      />
    </div>
  );
}