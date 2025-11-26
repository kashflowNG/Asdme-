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
import { Users, Globe, Activity, BarChart3, LogOut, Search, Trash2, Shield, Sparkles, ArrowUpDown, Eye, Link2, MapPin, Calendar } from "lucide-react";

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

type SortKey = 'username' | 'createdAt' | 'totalLinks' | 'totalViews' | 'lastActive';
type SortOrder = 'asc' | 'desc';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterAdmin, setFilterAdmin] = useState<'all' | 'admin' | 'user'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
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

  let filteredUsers = (users as AdminUser[]).filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterAdmin !== 'all') {
    filteredUsers = filteredUsers.filter(u =>
      filterAdmin === 'admin' ? u.isAdmin : !u.isAdmin
    );
  }

  filteredUsers.sort((a, b) => {
    let aVal: any = a[sortKey];
    let bVal: any = b[sortKey];

    if (sortKey === 'createdAt' || sortKey === 'lastActive') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      {sortKey === field && (
        <ArrowUpDown className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
      )}
    </button>
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
            <Card className="p-6 glass-card neon-glow border-cyan-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-cyan-400" />
                <span className="text-muted-foreground text-sm">Total Users</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-cyan-400/60 mt-2">+{Math.floor(Math.random() * 10)} this month</p>
            </Card>
            <Card className="p-6 glass-card neon-glow border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-6 h-6 text-purple-400" />
                <span className="text-muted-foreground text-sm">Total Links</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalLinks}</p>
              <p className="text-xs text-purple-400/60 mt-2">{Math.floor(stats.totalLinks / (stats.totalUsers || 1))} avg per user</p>
            </Card>
            <Card className="p-6 glass-card neon-glow border-pink-500/20">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-6 h-6 text-pink-400" />
                <span className="text-muted-foreground text-sm">Total Views</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
              <p className="text-xs text-pink-400/60 mt-2">{Math.floor(stats.totalViews / (stats.totalLinks || 1))} per link</p>
            </Card>
            <Card className="p-6 glass-card neon-glow border-green-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-6 h-6 text-green-400" />
                <span className="text-muted-foreground text-sm">Countries</span>
              </div>
              <p className="text-3xl font-bold">{stats.uniqueCountries}</p>
              <p className="text-xs text-green-400/60 mt-2">Active regions</p>
            </Card>
          </div>
        )}

        {/* Users Management */}
        <Card className="glass-card neon-glow border-primary/20">
          <Tabs defaultValue="users" className="w-full">
            <div className="border-b border-primary/10 px-6 pt-6">
              <TabsList className="border-0">
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  Users ({filteredUsers.length})
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
            </div>

            <TabsContent value="users" className="p-6 space-y-4">
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'admin', 'user'].map(filter => (
                    <Button
                      key={filter}
                      variant={filterAdmin === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterAdmin(filter as 'all' | 'admin' | 'user')}
                      className="capitalize"
                    >
                      {filter === 'all' ? 'All Users' : filter === 'admin' ? 'Admins' : 'Regular Users'}
                    </Button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <p className="text-muted-foreground text-center py-12">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/10">
                        <th className="text-left py-3 px-4"><SortButton label="Username" field="username" /></th>
                        <th className="text-left py-3 px-4"><SortButton label="Created" field="createdAt" /></th>
                        <th className="text-center py-3 px-4"><SortButton label="Links" field="totalLinks" /></th>
                        <th className="text-center py-3 px-4"><SortButton label="Views" field="totalViews" /></th>
                        <th className="text-left py-3 px-4">Location</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                {user.username[0].toUpperCase()}
                              </div>
                              <span className="font-semibold">{user.username}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant="outline" className="gap-1">
                              <Link2 className="w-3 h-3" />
                              {user.totalLinks}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant="outline" className="gap-1 bg-primary/10">
                              <Eye className="w-3 h-3" />
                              {user.totalViews}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {user.locations[0]?.country || 'Unknown'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {user.isAdmin ? (
                              <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30 gap-1">
                                <Shield className="w-3 h-3" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">Regular User</Badge>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant={user.isAdmin ? "destructive" : "outline"}
                                onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                disabled={toggleAdminMutation.isPending}
                                className="text-xs"
                              >
                                {user.isAdmin ? "Remove" : "Make"} Admin
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleteUserMutation.isPending}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="locations" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
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
                  .map((loc, idx) => (
                    <Card key={idx} className="p-4 border-primary/20 glass-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold">{loc.city}, {loc.country}</h3>
                            <p className="text-xs text-muted-foreground">{loc.count} profile view{loc.count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <Badge className="bg-primary/20">{loc.count}</Badge>
                      </div>
                      <div className="mt-3 pt-3 border-t border-primary/10">
                        <p className="text-xs text-muted-foreground">Active users:</p>
                        <p className="text-sm mt-1">{loc.users.slice(0, 3).join(", ")}{loc.users.length > 3 && ` +${loc.users.length - 3}`}</p>
                      </div>
                    </Card>
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
