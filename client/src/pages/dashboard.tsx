import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { EditLinkDialog } from "@/components/EditLinkDialog";
import { NeropageLogo } from "@/components/NeropageLogo";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { AppearanceEditor } from "@/components/AppearanceEditor";
import { SEOEditor } from "@/components/SEOEditor";
import { ContentBlockManager } from "@/components/ContentBlockManager";
import { CustomDomainManager } from "@/components/CustomDomainManager";
import { LinkGroupManager } from "@/components/LinkGroupManager";
import { TemplateBrowser } from "@/components/TemplateBrowser";
import { ABTestManager } from "@/components/ABTestManager";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { ClickHeatmap } from "@/components/ClickHeatmap";
import { LinkScheduleVisualizer } from "@/components/LinkScheduleVisualizer";
import { EngagementAlerts } from "@/components/EngagementAlerts";
import { ImageToPNGConverter } from "@/components/ImageToPNGConverter";
import { StreakWidget } from "@/components/StreakWidget";
import { getPlatform } from "@/lib/platforms";
import { GripVertical, Trash2, Plus, Eye, Upload, Copy, Check, ExternalLink, LogOut, QrCode, BarChart3, Link2, Palette, Settings, Zap, Edit, EyeOff, FileCode, Mail, Sparkles, Camera, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import type { Profile, SocialLink, ContentBlock } from "@shared/schema";
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
  onEdit: (link: SocialLink) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

function SortableLinkItem({ link, onDelete, onEdit, onToggle }: SortableLinkItemProps) {
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

  const isEnabled = typeof link.enabled === 'number' ? link.enabled === 1 : link.enabled !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-card-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all ${!isEnabled ? 'opacity-60' : ''}`}
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
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{link.customTitle || platform.name}</p>
          {!isEnabled && <EyeOff className="w-3 h-3 text-muted-foreground" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => onToggle(link.id, checked)}
          data-testid={`switch-toggle-${link.platform}`}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(link)}
          className="flex-shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
          data-testid={`button-edit-${link.platform}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
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
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || "overview";
  });

  const handleTabChange = (value: string) => {
    window.location.hash = value;
    window.location.reload();
  };
  const [profileForm, setProfileForm] = useState({
    username: "",
    bio: "",
    avatar: "",
    aboutMe: "",
    businessInfo: "",
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);
  const [coverPhotoProgress, setCoverPhotoProgress] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

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

  const { data: contentBlocks = [] } = useQuery<ContentBlock[]>({
    queryKey: ["/api/content-blocks"],
  });

  const { data: formSubmissions = [] } = useQuery<any[]>({
    queryKey: ["/api/form-submissions"],
  });

  useEffect(() => {
    if (profile && profile.id !== lastCommittedProfile.current?.id) {
      const profileData = {
        username: profile.username,
        bio: profile.bio || "",
        avatar: profile.avatar || "",
        aboutMe: profile.aboutMe || "",
        businessInfo: profile.businessInfo || "",
      };
      setProfileForm(profileData);
      lastCommittedProfile.current = profile;
    }
  }, [profile]);

  // Check if user is admin
  useEffect(() => {
    (async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/check");
        setIsAdmin(response?.isAdmin || false);
      } catch (e) {
        setIsAdmin(false);
      }
    })();
  }, []);

  // Auto-refresh data every 3 seconds for instant updates
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/detailed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/form-submissions"] });
    }, 3000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
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
          aboutMe: lastCommittedProfile.current.aboutMe || "",
          businessInfo: lastCommittedProfile.current.businessInfo || "",
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

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SocialLink> }) => {
      return await apiRequest("PATCH", `/api/links/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link updated",
        description: "Your link has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update link",
        variant: "destructive",
      });
    },
  });

  const toggleLinkMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return await apiRequest("PATCH", `/api/links/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle link",
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

  const handleUpdateProfile = (field: "username" | "bio" | "avatar" | "aboutMe" | "businessInfo") => {
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size must be less than 500MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPEG, PNG, GIF, WebP images and MP4, WebM, MOV, AVI videos are allowed",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('image', file);

      const data = await apiRequest('POST', '/api/upload-image', formData);
      await updateProfileMutation.mutateAsync({ avatar: data.url });

      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated successfully",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setUploadingAvatar(false);
        setUploadProgress(0);
      }, 500);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size must be less than 500MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPEG, PNG, GIF, WebP images are allowed for cover photos",
        variant: "destructive",
      });
      return;
    }

    setUploadingCoverPhoto(true);
    setCoverPhotoProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setCoverPhotoProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('image', file);

      const data = await apiRequest('POST', '/api/upload-image', formData);
      await updateProfileMutation.mutateAsync({ coverPhoto: data.url });

      toast({
        title: "Cover photo uploaded",
        description: "Your cover photo has been updated successfully",
      });

      clearInterval(progressInterval);
      setCoverPhotoProgress(100);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload cover photo",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setUploadingCoverPhoto(false);
        setCoverPhotoProgress(0);
      }, 500);
      if (coverPhotoInputRef.current) {
        coverPhotoInputRef.current.value = '';
      }
    }
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
      await apiRequest("POST", "/api/auth/logout");

      // Clear token from localStorage
      localStorage.removeItem('neropage_auth_token');

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

  const handleDelete = (id: string) => {
    deleteLinkMutation.mutate(id);
  };

  const handleEditLink = (link: SocialLink) => {
    setEditingLink(link);
    setShowEditDialog(true);
  };

  const handleUpdateLink = (updates: Partial<SocialLink>) => {
    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink.id, updates });
      setShowEditDialog(false);
      setEditingLink(null);
    }
  };

  const handleToggleLink = (id: string, enabled: boolean) => {
    toggleLinkMutation.mutate({ id, enabled });
  };

  return (
    <>
      <Helmet>
        <script async data-cfasync="false" src="//pl28091865.effectivegatecpm.com/d3086215aaf6d1aac4a8cf2c4eda801b/invoke.js"></script>
        <script type='text/javascript' src='//pl28091887.effectivegatecpm.com/cf/47/df/cf47df159320ecb4f3636e497a6d0d1f.js'></script>
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
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/admin")}
                      className="gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 text-yellow-600 hover:text-yellow-700"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  )}
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

          {/* Persistent Ad Placement - Above All Tabs */}
          <div className="flex justify-center py-4 mt-6">
            <div className="w-full max-w-md mx-auto">
              <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b"></div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
            <TabsList className="grid w-full grid-cols-7 h-auto p-1 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="overview" className="gap-1 py-3 px-1 text-xs" title="View analytics and performance metrics">
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Overview</span>
                <span className="sm:hidden font-medium">Over</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-1 py-3 px-1 text-xs" title="Edit profile info and photos">
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Profile</span>
                <span className="sm:hidden font-medium">Prof</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-1 py-3 px-1 text-xs" title="Manage your social links">
                <Link2 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Links</span>
                <span className="sm:hidden font-medium">Link</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-1 py-3 px-1 text-xs" title="Upload and manage media files">
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Media</span>
                <span className="sm:hidden font-medium">Med</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-1 py-3 px-1 text-xs" title="Customize colors and styling">
                <Palette className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Appearance</span>
                <span className="sm:hidden font-medium">App</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-1 py-3 px-1 text-xs" title="Browse and apply design templates">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Templates</span>
                <span className="sm:hidden font-medium">Tmpl</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-1 py-3 px-1 text-xs" title="Advanced features and settings">
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Advanced</span>
                <span className="sm:hidden font-medium">Adv</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <StreakWidget />
              <AnalyticsDashboard />
              <ClickHeatmap />
              <LinkScheduleVisualizer links={sortedLinks.map(l => ({ ...l, scheduleStart: l.scheduleStart || undefined, scheduleEnd: l.scheduleEnd || undefined }))} />
              <SmartRecommendations
                existingPlatforms={links.map(l => l.platform)}
                onAddPlatform={() => setShowAddDialog(true)}
              />
              {/* Form Submissions */}
              {formSubmissions.length > 0 && (
                <Card className="p-6 glass-card neon-glow">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Form Submissions ({formSubmissions.length})
                  </h3>
                  <div className="space-y-4">
                    {formSubmissions.map((submission: any) => (
                      <Card key={submission.id} className="p-4 bg-muted/30">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{submission.name}</p>
                              <p className="text-sm text-muted-foreground">{submission.email}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(submission.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm">{submission.message}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}
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

                {/* Cover Photo Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Cover Photo</Label>
                  <div className="relative w-full h-32 bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-lg overflow-hidden border-2 border-dashed border-border">
                    {profile?.coverPhoto ? (
                      <img 
                        src={profile.coverPhoto} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <p className="text-xs">No cover photo yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={coverPhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleCoverPhotoUpload}
                      className="hidden"
                      data-testid="input-cover-photo-file"
                    />
                    <Button
                      variant="outline"
                      onClick={() => coverPhotoInputRef.current?.click()}
                      disabled={!profile || uploadingCoverPhoto}
                      className="flex-1 gap-2"
                      data-testid="button-upload-cover-photo"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingCoverPhoto ? "Uploading..." : "Upload Cover Photo"}
                    </Button>
                    {profile?.coverPhoto && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateProfileMutation.mutate({ coverPhoto: "" })}
                        disabled={uploadingCoverPhoto}
                        data-testid="button-remove-cover-photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1600x400px or larger (JPEG, PNG, GIF, WebP up to 500MB)
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-border">
                    <AvatarImage src={profile?.avatar || profileForm.avatar} alt={profile?.username} />
                    <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-medium">Profile Picture</Label>
                    <div className="flex gap-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        data-testid="input-avatar-file"
                      />
                      <Button
                        variant="outline"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={!profile || uploadingAvatar}
                        className="flex-1 gap-2"
                        data-testid="button-upload-avatar"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingAvatar ? "Uploading..." : "Upload Media"}
                      </Button>
                      {profile?.avatar && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateProfileMutation.mutate({ avatar: "" })}
                          disabled={uploadingAvatar}
                          data-testid="button-remove-avatar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload any image or video up to 500MB (JPEG, PNG, GIF, WebP, MP4, WebM, MOV, AVI)
                    </p>
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

              {/* About & Business Card */}
              <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">About & Business</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutMe">About Me</Label>
                  <Textarea
                    id="aboutMe"
                    placeholder="Share a brief personal summary or professional statement that will appear on your public profile..."
                    value={profileForm.aboutMe || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, aboutMe: e.target.value })}
                    onBlur={() => handleUpdateProfile("aboutMe")}
                    disabled={!profile}
                    className="min-h-24 resize-none"
                    data-testid="input-about-me"
                  />
                  <p className="text-xs text-muted-foreground">
                    Personal summary visible to visitors. Keep it concise and engaging.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessInfo">Business Information</Label>
                  <Textarea
                    id="businessInfo"
                    placeholder="Add your business details, services, location, hours, or any other relevant business information..."
                    value={profileForm.businessInfo || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, businessInfo: e.target.value })}
                    onBlur={() => handleUpdateProfile("businessInfo")}
                    disabled={!profile}
                    className="min-h-32 resize-none"
                    data-testid="input-business-info"
                  />
                  <p className="text-xs text-muted-foreground">
                    Business details like services, hours, location, etc. Supports multiple lines. This appears in the sidebar of your public profile.
                  </p>
                </div>
              </Card>

              <SEOEditor
                profile={profile || null}
                onUpdate={async (updates) => {
                  if (profile) {
                    await updateProfileMutation.mutateAsync(updates);
                    await queryClient.refetchQueries({ queryKey: ["/api/profiles/me"] });
                  }
                }}
              />
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
                              onEdit={handleEditLink}
                              onToggle={handleToggleLink}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </>
                )}
              </Card>

              <LinkGroupManager />
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6 mt-6">
              <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card bg-gradient-to-br from-background via-muted/5 to-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">SEO Image to PNG Converter</h2>
                        <Badge variant="outline" className="mt-1">
                          <Sparkles className="w-3 h-3 mr-1" />
                          SEO Feature
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Convert your image to PNG format for optimal social media sharing and SEO meta tags</p>
                  </div>
                </div>

                <ImageToPNGConverter
                  onPNGConverted={(url) => {
                    updateProfileMutation.mutate({ ogImage: url });
                    toast({
                      title: "Success",
                      description: "PNG image set as SEO meta image. It will appear when your link is shared!",
                    });
                  }}
                />

                <div className="space-y-6">
                  {/* Upload Section */}
                  <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 rounded-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-primary" />
                      Quick Upload
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Drag & drop or click to upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, MOV, AVI)
                    </p>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      data-testid="input-media-file"
                    />

                    {/* Upload Button with Progress */}
                    <div className="space-y-4">
                      <Button
                        variant="default"
                        size="lg"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="w-full gap-2 h-14 text-base font-semibold relative overflow-hidden group"
                        data-testid="button-upload-media"
                      >
                        {uploadingAvatar ? (
                          <>
                            <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                            <Upload className="w-5 h-5 animate-bounce" />
                            <span>Processing Upload...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Choose Media to Upload</span>
                          </>
                        )}
                      </Button>

                      {uploadingAvatar && (
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary via-cyan-500 to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <p className="text-xs text-center text-muted-foreground animate-pulse">
                            Optimizing and uploading your media...
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500" />
                          Max size: 500MB
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-primary" />
                          Instant processing
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Upload Success */}
                  {profile?.avatar && (
                    <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-500">Upload Successful!</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-sm rounded-xl border-2 border-emerald-500/20">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Your Media URL</p>
                            <p className="text-sm font-mono text-foreground truncate">
                              {window.location.origin}{profile.avatar}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={async () => {
                              await navigator.clipboard.writeText(`${window.location.origin}${profile.avatar}`);
                              toast({
                                title: "Copied!",
                                description: "Media URL copied to clipboard",
                              });
                            }}
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </Button>
                        </div>

                        {/* Preview */}
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Preview</p>
                          {profile.avatar.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={profile.avatar}
                              alt="Uploaded media"
                              className="max-h-32 rounded-lg border border-border"
                            />
                          ) : (
                            <video
                              src={profile.avatar}
                              className="max-h-32 rounded-lg border border-border"
                              controls
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usage Guide */}
                  <div className="p-6 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border-2 border-cyan-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                        <ExternalLink className="w-5 h-5 text-cyan-500" />
                      </div>
                      <h3 className="text-lg font-bold">Where to Use Your Media URLs</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Link2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1">Platform Links</p>
                          <p className="text-xs text-muted-foreground">Use the URL in your social media links and custom link buttons</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 hover:border-cyan-500/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                          <FileCode className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1">Content Blocks</p>
                          <p className="text-xs text-muted-foreground">Embed images and videos in your content blocks for rich media displays</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Palette className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Profile Customization</p>
                          <p className="text-xs text-muted-foreground">Use as your avatar, background image, or OG image for social sharing</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">External Platforms</p>
                          <p className="text-xs text-muted-foreground">Share your media URLs on any website, email, or social media platform</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tips */}
                  <div className="p-6 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border-2 border-yellow-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                      </div>
                      <h3 className="text-lg font-bold">Pro Tips</h3>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-yellow-500" />
                        </div>
                        <span className="text-muted-foreground">All uploaded media is permanently hosted and accessible via HTTPS</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-yellow-500" />
                        </div>
                        <span className="text-muted-foreground">Use these URLs in the "Add Link" feature by selecting "Custom" platform</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-yellow-500" />
                        </div>
                        <span className="text-muted-foreground">Perfect for showcasing portfolios, products, or personal media galleries</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-yellow-500" />
                        </div>
                        <span className="text-muted-foreground">URLs remain active even if you update your profile or redeploy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
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
                  updateProfile={async (updates) => {
                    await updateProfileMutation.mutateAsync(updates);
                  }}
                />
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6 mt-6">
              <Card className="p-6 border-purple-200/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <h2 className="text-2xl font-bold mb-2">Ready-Made Templates</h2>
                <p className="text-muted-foreground mb-6">Browse and apply beautiful templates created by our team</p>
                <TemplateBrowser />
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <ContentBlockManager />
              <CustomDomainManager />
              <ABTestManager />
            </TabsContent>
          </Tabs>
        </main>

        <AddLinkDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAdd={handleAddLink}
          existingPlatforms={links.map((link) => link.platform)}
        />

        <EditLinkDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          link={editingLink}
          onUpdate={handleUpdateLink}
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