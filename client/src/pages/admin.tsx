import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TemplateManager } from "@/components/TemplateManager";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Globe, Activity, BarChart3, LogOut, Search, Trash2, Shield, Sparkles } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  totalLinks: number;
  totalViews: number;
  locations: Array<{ country: string; city: string; count: number }>;
  lastActive: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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

  const { data: users = [], isLoading, refetch } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("GET", "/api/admin/users"),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery<{ totalUsers: number; totalLinks: number; totalViews: number; uniqueCountries: number }>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
    initialData: { totalUsers: 0, totalLinks: 0, totalViews: 0, uniqueCountries: 0 },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("DELETE", `/api/admin/users/${userId}`),
    onSuccess: () => {
      refetch();
      queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "User deleted",
        description: "The user has been removed from the system.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: (data: { userId: string; isAdmin: boolean }) =>
      apiRequest("PATCH", `/api/admin/users/${data.userId}`, { isAdmin: data.isAdmin }),
    onSuccess: () => {
      refetch();
      toast({
        title: "Updated",
        description: "User admin status changed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    deleteUserMutation.mutate(userId);
  };

  const handleToggleAdmin = (userId: string, isCurrentAdmin: boolean) => {
    toggleAdminMutation.mutate({ userId, isAdmin: !isCurrentAdmin });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card className="p-12 text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const filteredUsers = (users as AdminUser[]).filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-6">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage users and monitor platform activity</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/dashboard"} className="gap-2">
            <LogOut className="w-4 h-4" />
            Exit Admin
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="p-6 glass-card neon-glow">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-cyan-400" />
                <span className="text-muted-foreground text-sm">Total Users</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </Card>
            <Card className="p-6 glass-card neon-glow">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-6 h-6 text-purple-400" />
                <span className="text-muted-foreground text-sm">Total Links</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalLinks}</p>
            </Card>
            <Card className="p-6 glass-card neon-glow">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-6 h-6 text-pink-400" />
                <span className="text-muted-foreground text-sm">Total Views</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
            </Card>
            <Card className="p-6 glass-card neon-glow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-6 h-6 text-green-400" />
                <span className="text-muted-foreground text-sm">Countries</span>
              </div>
              <p className="text-3xl font-bold">{stats.uniqueCountries}</p>
            </Card>
          </div>
        )}

        {/* Users Management */}
        <Card className="glass-card neon-glow">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="border-b">
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="locations" className="gap-2">
                <Globe className="w-4 h-4" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              {isLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No users found</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold">{user.username}</p>
                          {user.isAdmin && (
                            <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <span>📍 {user.locations[0]?.country || 'Unknown'}</span>
                          <span>🔗 {user.totalLinks} links</span>
                          <span>👁️ {user.totalViews} views</span>
                          <span>⏰ {new Date(user.lastActive).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={user.isAdmin ? "destructive" : "outline"}
                          onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                          disabled={toggleAdminMutation.isPending}
                        >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="locations" className="p-6">
              <div className="grid gap-4">
                {(users as AdminUser[]).reduce((acc: any[], user) => {
                  user.locations.forEach(loc => {
                    const existing = acc.find(
                      l => l.country === loc.country && l.city === loc.city
                    );
                    if (existing) {
                      existing.count += loc.count;
                      existing.users.push(user.username);
                    } else {
                      acc.push({
                        country: loc.country,
                        city: loc.city,
                        count: loc.count,
                        users: [user.username],
                      });
                    }
                  });
                  return acc;
                }, [])
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 50)
                  .map((loc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{loc.city}, {loc.country}</h3>
                        <Badge>{loc.count} users</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {loc.users.slice(0, 5).join(", ")}
                        {loc.users.length > 5 && ` +${loc.users.length - 5} more`}
                      </p>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="p-6">
              <TemplateManager />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
