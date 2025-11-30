import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TemplateManager } from "@/components/TemplateManager";
import { SendPointsToUsers } from "@/components/SendPointsToUsers";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Globe, Activity, BarChart3, LogOut, Search, Trash2, Shield, Sparkles, ArrowUpDown, Eye, Link2, MapPin, Calendar, ShoppingBag, Plus } from "lucide-react";
import { AnimatedGalaxyBackground } from "@/components/AnimatedGalaxyBackground";
import { AdminDashboardLoadout } from "@/components/AdminDashboardLoadout";
import { Helmet } from "react-helmet";

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
  const [shopForm, setShopForm] = useState({ name: '', description: '', pointCost: 100, type: 'layout' });
  const [shopItems, setShopItems] = useState<any[]>([]);

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

  const { data: fetchedShopItems = [] } = useQuery<any[]>({
    queryKey: ["/api/shop/items"],
    enabled: isAdmin,
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

  const createShopItemMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/shop/items", data),
    onSuccess: () => {
      setShopForm({ name: '', description: '', pointCost: 100, type: 'layout' });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
      toast({ title: "Shop item created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create shop item", variant: "destructive" });
    },
  });

  const deleteShopItemMutation = useMutation({
    mutationFn: (itemId: string) => apiRequest("DELETE", `/api/admin/shop/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
      toast({ title: "Item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <AnimatedGalaxyBackground />
        <Card className="p-12 text-center max-w-md relative z-10">
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
    <>
      <Helmet>
        <script async data-cfasync="false" src="//pl28091865.effectivegatecpm.com/d3086215aaf6d1aac4a8cf2c4eda801b/invoke.js"></script>
        <script type='text/javascript' src='//pl28091887.effectivegatecpm.com/cf/47/df/cf47df159320ecb4f3636e497a6d0d1f.js'></script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4 sm:p-6 relative overflow-hidden">
        <AnimatedGalaxyBackground />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="mb-10 pb-8 border-b border-primary/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-400">Manage platform, users, and system settings</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/dashboard"} 
                className="gap-2 hover:bg-purple-500/20 hover:border-purple-400 whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                Exit Admin
              </Button>
            </div>
          </div>

          {/* Platform Overview */}
          {stats && (
            <div className="mb-12">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Platform Overview
                </h2>
              </div>
              <AdminDashboardLoadout
                totalUsers={stats.totalUsers}
                totalLinks={stats.totalLinks}
                totalViews={stats.totalViews}
                uniqueCountries={stats.uniqueCountries}
              />
            </div>
          )}

          {/* Management Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              Management & Controls
            </h2>
          </div>

          {/* Management Tabs */}
          <Card className="glass-card neon-glow border-primary/20 relative overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg blur opacity-10 pointer-events-none"></div>
            <div className="relative">
              <Tabs defaultValue="users" className="w-full">
                {/* Tab Headers */}
                <div className="border-b border-primary/10 bg-slate-800/30 backdrop-blur-sm">
                  <div className="px-4 sm:px-6 pt-4">
                    <TabsList className="border-0 bg-transparent gap-1 w-full sm:w-auto flex flex-wrap">
                      <TabsTrigger 
                        value="users" 
                        className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-cyan-400 rounded-lg px-4 py-2"
                      >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Users</span>
                        <Badge variant="outline" className="text-xs ml-1">{filteredUsers.length}</Badge>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="locations" 
                        className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-cyan-400 rounded-lg px-4 py-2"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">Locations</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="templates" 
                        className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-cyan-400 rounded-lg px-4 py-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">Templates</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="points" 
                        className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-cyan-400 rounded-lg px-4 py-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Points</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="shop" 
                        className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-cyan-400 rounded-lg px-4 py-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span className="hidden sm:inline">Shop</span>
                        <Badge variant="outline" className="text-xs ml-1">{fetchedShopItems.length}</Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* Users Tab */}
                <TabsContent value="users" className="p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-800/50 border-primary/20"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      {['all', 'admin', 'user'].map(filter => (
                        <Button
                          key={filter}
                          variant={filterAdmin === filter ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterAdmin(filter as 'all' | 'admin' | 'user')}
                          className="capitalize text-xs sm:text-sm"
                        >
                          {filter === 'all' ? 'All' : filter === 'admin' ? 'Admins' : 'Users'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading users...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-primary/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/10 bg-slate-800/50">
                            <th className="text-left py-3 px-4 font-semibold"><SortButton label="Username" field="username" /></th>
                            <th className="text-left py-3 px-4 font-semibold hidden sm:table-cell"><SortButton label="Created" field="createdAt" /></th>
                            <th className="text-center py-3 px-4 font-semibold"><SortButton label="Links" field="totalLinks" /></th>
                            <th className="text-center py-3 px-4 font-semibold hidden md:table-cell"><SortButton label="Views" field="totalViews" /></th>
                            <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">Location</th>
                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                            <th className="text-right py-3 px-4 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {user.username[0].toUpperCase()}
                                  </div>
                                  <span className="font-semibold truncate">{user.username}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <Link2 className="w-3 h-3" />
                                  {user.totalLinks}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-center hidden md:table-cell">
                                <Badge variant="outline" className="gap-1 bg-primary/10 text-xs">
                                  <Eye className="w-3 h-3" />
                                  {user.totalViews}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm hidden lg:table-cell">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{user.locations && user.locations.length > 0 ? `${user.locations[0].country}` : 'N/A'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {user.isAdmin ? (
                                  <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30 gap-1 text-xs">
                                    <Shield className="w-3 h-3" />
                                    Admin
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground text-xs">User</Badge>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant={user.isAdmin ? "destructive" : "outline"}
                                    onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                    disabled={toggleAdminMutation.isPending}
                                    className="text-xs"
                                  >
                                    {user.isAdmin ? "Remove" : "Make"}
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

                {/* Locations Tab */}
                <TabsContent value="locations" className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
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
                        <Card key={idx} className="p-4 border-primary/20 glass-card bg-slate-800/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <h3 className="font-bold text-sm">{loc.city || loc.country}, {loc.country}</h3>
                                <p className="text-xs text-muted-foreground">{loc.count} view{loc.count !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{loc.count}</Badge>
                          </div>
                          <div className="mt-3 pt-3 border-t border-primary/10">
                            <p className="text-xs text-muted-foreground mb-1">Users:</p>
                            <p className="text-xs">{loc.users.slice(0, 2).join(", ")}{loc.users.length > 2 && ` +${loc.users.length - 2}`}</p>
                          </div>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="p-4 sm:p-6">
                  <TemplateManager />
                </TabsContent>

                {/* Points Tab */}
                <TabsContent value="points" className="p-4 sm:p-6">
                  <SendPointsToUsers />
                </TabsContent>

                {/* Shop Tab */}
                <TabsContent value="shop" className="p-4 sm:p-6 space-y-6">
                  {/* Create Item Form */}
                  <Card className="p-4 sm:p-6 bg-slate-800/30 border-primary/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-cyan-400" />
                      Add New Shop Item
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Item Name</label>
                        <Input
                          placeholder="e.g., Grid Layout Pack"
                          value={shopForm.name}
                          onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                          className="bg-slate-800/50 border-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
                        <Input
                          placeholder="e.g., Professional grid-based layouts"
                          value={shopForm.description}
                          onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                          className="bg-slate-800/50 border-primary/20"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-1 block">Point Cost</label>
                          <Input
                            type="number"
                            min="10"
                            value={shopForm.pointCost}
                            onChange={(e) => setShopForm({ ...shopForm, pointCost: parseInt(e.target.value) })}
                            className="bg-slate-800/50 border-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-1 block">Type</label>
                          <select 
                            value={shopForm.type}
                            onChange={(e) => setShopForm({ ...shopForm, type: e.target.value })}
                            className="w-full bg-slate-800/50 border border-primary/20 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            <option value="layout">Layout</option>
                            <option value="theme">Theme</option>
                            <option value="feature">Feature</option>
                          </select>
                        </div>
                      </div>
                      <Button 
                        onClick={() => createShopItemMutation.mutate(shopForm)}
                        disabled={!shopForm.name || createShopItemMutation.isPending}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                      >
                        Add Item
                      </Button>
                    </div>
                  </Card>

                  {/* Items List */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Marketplace Items ({fetchedShopItems.length})</h3>
                    {fetchedShopItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">No items in shop yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fetchedShopItems.map((item: any) => (
                          <Card key={item.id} className="p-4 bg-slate-800/30 border-primary/20">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-white">{item.name}</h4>
                                <Badge className="text-xs mt-1 bg-primary/20">{item.type}</Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteShopItemMutation.mutate(item.id)}
                                disabled={deleteShopItemMutation.isPending}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">💎 {item.pointCost} points</Badge>
                              {!item.isActive && <Badge className="text-xs bg-gray-600">Inactive</Badge>}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}