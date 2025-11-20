import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { NeropageLogo } from "@/components/NeropageLogo";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { AppearanceEditor } from "@/components/AppearanceEditor";
import { SEOEditor } from "@/components/SEOEditor";
import { ContentBlockManager } from "@/components/ContentBlockManager";
import { CustomDomainManager } from "@/components/CustomDomainManager";
import { LinkGroupManager } from "@/components/LinkGroupManager";
import { TemplateSelector } from "@/components/TemplateSelector";
import { ABTestManager } from "@/components/ABTestManager";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { ClickHeatmap } from "@/components/ClickHeatmap";
import { LinkScheduleVisualizer } from "@/components/LinkScheduleVisualizer";
import { EngagementAlerts } from "@/components/EngagementAlerts";
import { getPlatform } from "@/lib/platforms";
import { GripVertical, Trash2, Plus, Eye, Upload, Copy, Check, ExternalLink, LogOut, QrCode, BarChart3, Link2, Palette, Settings, Zap } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Helmet } from "react-helmet";

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
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileForm, setProfileForm] = useState({
    username: "",
    bio: "",
    avatar: "",
  });

  const lastCommittedProfile = useRef<Profile | null>(null);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profiles/me"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: links = [] } = useQuery<SocialLink[]>({
    queryKey: ["/api/links"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

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

  // Removed the ad script injection from useEffect as it's now handled by Helmet
  // The ad script will be loaded automatically by Helmet

  // Auto-refresh data every 3 seconds for instant updates
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/detailed"] });
    }, 3000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username?: string; bio?: string; avatar?: string }) => {
      return await apiRequest("PATCH", "/api/profiles/me", data);
    },
    onSuccess: async (updatedProfile: Profile) => {
      queryClient.setQueryData(["/api/profiles/me"], updatedProfile);
      lastCommittedProfile.current = updatedProfile;
      await queryClient.refetchQueries({ queryKey: ["/api/profiles/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error: Error) => {
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
    mutationFn: async (data: {
      platform: string;
      url: string;
      customTitle?: string;
      badge?: string;
      description?: string;
      isScheduled?: boolean;
      scheduleStart?: string;
      scheduleEnd?: string;
      image?: File; // Added for image upload
    }) => {
      const formData = new FormData();
      formData.append("platform", data.platform);
      formData.append("url", data.url);
      if (data.customTitle) formData.append("customTitle", data.customTitle);
      if (data.badge) formData.append("badge", data.badge);
      if (data.description) formData.append("description", data.description);
      if (data.isScheduled !== undefined) formData.append("isScheduled", String(data.isScheduled));
      if (data.scheduleStart) formData.append("scheduleStart", data.scheduleStart);
      if (data.scheduleEnd) formData.append("scheduleEnd", data.scheduleEnd);
      if (data.image) formData.append("image", data.image); // Append image file

      return await apiRequest("POST", "/api/links", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link added",
        description: "Your social link has been added successfully",
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

    if (!lastCommittedProfile.current) {
      return;
    }

    const committedValue = (lastCommittedProfile.current[field] || "") as string;

    if (value === committedValue) {
      return;
    }

    if (field === "username" && value.trim() === "") {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      setProfileForm({ ...profileForm, username: committedValue });
      return;
    }

    updateProfileMutation.mutate({ [field]: value });
  };

  const handleAddLink = (
    platform: string,
    url: string,
    customTitle?: string,
    badge?: string,
    description?: string,
    isScheduled?: boolean,
    scheduleStart?: string,
    scheduleEnd?: string,
    image?: File // Added for image upload
  ) => {
    createLinkMutation.mutate({
      platform,
      url,
      customTitle,
      badge,
      description,
      isScheduled,
      scheduleStart,
      scheduleEnd,
      image, // Pass image to mutation
    });
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

  const handleSignOut = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });

      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });

      queryClient.clear();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
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

  // Dummy handleDelete function to satisfy the types in the changes, as it's not defined in original
  const handleDelete = (id: string) => {
    deleteLinkMutation.mutate(id);
  };

  return (
    <>
      <Helmet>
        <script async data-cfasync="false" src="//pl28091865.effectivegatecpm.com/d3086215aaf6d1aac4a8cf2c4eda801b/invoke.js"></script>
      </Helmet>

      <div className="min-h-screen bg-background relative">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <header className="sticky top-0 z-50 h-16 px-4 border-b border-glow-animate bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              {profile && (
                <>
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid="button-sign-out"
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will need to sign in again to access your dashboard and manage your profile.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleSignOut}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sign Out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
          <EngagementAlerts />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1">
              <TabsTrigger value="overview" className="gap-2 py-3">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2 py-3">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-2 py-3">
                <Link2 className="w-4 h-4" />
                <span className="hidden sm:inline">Links</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2 py-3">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2 py-3">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <AnalyticsDashboard />
              <ClickHeatmap />
              <LinkScheduleVisualizer links={sortedLinks} />
              <SmartRecommendations
                existingPlatforms={links.map(l => l.platform)}
                onAddPlatform={() => setShowAddDialog(true)}
              />

              {/* Ad Placement - Overview Tab */}
              <div className="flex justify-center py-6">
                <div className="w-full max-w-sm mx-auto">
                  <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b"></div>
                </div>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card" data-testid="card-profile-editor">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Profile Settings</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                    <span className="text-xs text-muted-foreground font-medium">Active</span>
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
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/user/${profile.username}`, '_blank')}
                      className="h-10 gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </Button>
                    <Button
                      onClick={handleCopyLink}
                      className="h-10 gap-2"
                      data-testid="button-copy-link"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowQRDialog(true)}
                      className="h-10 gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="hidden sm:inline">QR Code</span>
                    </Button>
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
              </Card>

              <SEOEditor
                profile={profile!}
                onUpdate={async (updates) => {
                  if (profile) {
                    await updateProfileMutation.mutateAsync(updates);
                    await queryClient.refetchQueries({ queryKey: ["/api/profiles/me"] });
                  }
                }}
              />

              {/* Ad Placement - Profile Tab */}
              <div className="flex justify-center py-6">
                <div className="w-full max-w-sm mx-auto">
                  <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b"></div>
                </div>
              </div>
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links" className="space-y-6 mt-6">
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
                  <>
                    {/* Drag and Drop Links */}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={sortedLinks.map(l => l.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {sortedLinks.map((link) => (
                            <SortableLinkItem
                              key={link.id}
                              link={link}
                              onDelete={() => handleDelete(link.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {/* Ad Placement - Bottom of links section */}
                    <div className="flex justify-center py-6 mt-6">
                      <div className="w-full max-w-md mx-auto">
                        <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b"></div>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              <LinkGroupManager />
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6 mt-6">
              {profile && (
                <AppearanceEditor
                  profile={profile}
                  onUpdate={async (updates) => {
                    if (profile) {
                      await updateProfileMutation.mutateAsync(updates);
                      await queryClient.refetchQueries({ queryKey: ["/api/profiles/me"] });
                    }
                  }}
                />
              )}
              <TemplateSelector />

              {/* Ad Placement - Appearance Tab */}
              <div className="flex justify-center py-6">
                <div className="w-full max-w-sm mx-auto">
                  <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b"></div>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <ContentBlockManager />
              <CustomDomainManager />
              <ABTestManager />

              {/* Ad Placement - Advanced Tab */}
              <div className="flex justify-center py-6">
                <div className="w-full max-w-sm mx-auto">
                  <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b"></div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <AddLinkDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAdd={handleAddLink}
          existingPlatforms={links.map((link) => link.platform)}
        />

        {profile && (
          <AlertDialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold text-center">Your Profile QR Code</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  Share your Neropage profile instantly with a QR code
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-6">
                <QRCodeGenerator url={`${window.location.origin}/user/${profile.username}`} />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </>
  );
}