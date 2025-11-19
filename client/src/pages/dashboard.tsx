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
import { GripVertical, Trash2, Plus, Eye, Upload } from "lucide-react";
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

  const createLinkMutation = useMutation({
    mutationFn: async (data: { platform: string; url: string }) => {
      return await apiRequest("POST", "/api/links", {
        platform: data.platform,
        url: data.url,
        order: links.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link added",
        description: "Your social link has been added successfully.",
      });
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

  const handleAddLink = (platform: string, url: string) => {
    createLinkMutation.mutate({ platform, url });
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
          <div className="flex items-center gap-2 animate-float">
            <NeropageLogo size={32} />
            <h1 className="text-xl font-bold gradient-shimmer bg-clip-text text-transparent">Neropage</h1>
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
            <h2 className="text-2xl font-bold">Profile Configuration</h2>
            <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">PRO</span>
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
        </Card>

        <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-links-manager">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Platform Links</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your digital presence across 25+ platforms</p>
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
            <div className="text-center py-16 space-y-4 bg-gradient-to-b from-primary/5 to-transparent rounded-xl border-2 border-dashed">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">No platforms connected yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start building your unified digital presence</p>
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