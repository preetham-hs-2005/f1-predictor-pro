import { useState, useEffect, useMemo } from "react";
import { getAdminUsers, toggleUserAdminRole, deleteAdminUser, getUserPredictions, toggleUserLeaderboardVisibility, type AdminUser, type AdminPrediction } from "@/lib/api/admin";
import { useDrivers } from "@/hooks/useDrivers";
import { raceCalendar } from "@/lib/data/raceCalendar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, ShieldOff, Trash2, Download, Search, Filter, TrendingUp, Eye, EyeOff, Eye as EyeViewIcon } from "lucide-react";

const AdminUsersAdvanced = () => {
  const { user: currentUser } = useAuth();
  const { getDriverById } = useDrivers(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [showHidden, setShowHidden] = useState(false);
  const [selectedUserForPredictions, setSelectedUserForPredictions] = useState<AdminUser | null>(null);
  const [userPredictions, setUserPredictions] = useState<AdminPrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAdminUsers();
    setUsers(data);
    setLoading(false);
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // ALWAYS filter out hidden users by default, UNLESS showHidden is explicitly true
    // This ensures hidden users never appear unless the admin explicitly views them
    if (!showHidden) {
      filtered = filtered.filter((u) => {
        // Only include users where hidden is NOT set to true
        // This explicitly excludes any user with hidden: true
        const isHidden = u.hidden === true;
        return !isHidden;
      });
    }

    // Role filter
    if (filterRole === "admin") {
      filtered = filtered.filter((u) => u.role === "admin");
    } else if (filterRole === "user") {
      filtered = filtered.filter((u) => u.role !== "admin");
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((u) => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [users, searchQuery, filterRole, showHidden]);

  const handleToggleRole = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast.error("You can't change your own role");
      return;
    }
    
    const success = await toggleUserAdminRole(userId);
    if (success) {
      toast.success(`${userName} role updated`);
      loadUsers();
    } else {
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast.error("You can't delete your own account");
      return;
    }
    if (confirm(`Are you sure you want to delete user "${userName}" and all their data?`)) {
      const success = await deleteAdminUser(userId);
      if (success) {
        toast.success(`User "${userName}" deleted`);
        loadUsers();
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleExportUserData = (user: AdminUser) => {
    try {
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        totalPoints: user.totalPoints,
        predictions: user.predictions,
        exportDate: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `user-data-${user.name}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("User data exported!");
    } catch (error) {
      toast.error("Failed to export user data");
    }
  };

  const handleViewPredictions = async (user: AdminUser) => {
    setSelectedUserForPredictions(user);
    setDialogOpen(true);
    setLoadingPredictions(true);
    try {
      const predictions = await getUserPredictions(user.id);
      setUserPredictions(predictions);
    } catch (error) {
      toast.error("Failed to load predictions");
      console.error(error);
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleToggleVisibility = async (userId: string, userName: string, currentHidden?: boolean) => {
    try {
      console.log(`Toggling visibility for ${userId}, current hidden: ${currentHidden}`);
      const success = await toggleUserLeaderboardVisibility(userId);
      console.log(`Toggle visibility response: ${success}`);
      
      if (success) {
        const action = currentHidden ? "visible on" : "hidden from";
        toast.success(`${userName} is now ${action} the leaderboard`);
        // Refresh users to get updated hidden status
        await loadUsers();
      } else {
        toast.error("Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Error toggling visibility");
    }
  };

  const getRaceName = (raceId: string) => {
    const race = raceCalendar.find((r) => r.id === raceId);
    return race ? `${race.countryFlag} R${race.round} · ${race.raceName}` : `Race: ${raceId}`;
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    regularUsers: users.filter((u) => u.role !== "admin").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass rounded-xl p-6 h-24 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold f1-heading">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold f1-heading text-primary">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold f1-heading">{stats.regularUsers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterRole === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("all")}
                className="gap-1"
              >
                <Filter className="h-3 w-3" />
                All
              </Button>
              <Button
                variant={filterRole === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("admin")}
              >
                Admins
              </Button>
              <Button
                variant={filterRole === "user" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("user")}
              >
                Users
              </Button>
              <Button
                variant={showHidden ? "default" : "outline"}
                size="sm"
                onClick={() => setShowHidden(!showHidden)}
              >
                {showHidden ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                Hidden ({users.filter((u) => u.hidden).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base">Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Live data from MongoDB</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users found matching your filters.</p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-lg bg-background/30 border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold truncate">{u.name}</span>
                        {u.role === "admin" && (
                          <Badge className="bg-primary/20 text-primary text-[10px] shrink-0">
                            <Shield className="h-2.5 w-2.5 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {u.id === currentUser?.id && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">{u.email}</p>
                      
                      {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="p-2 rounded bg-background/50">
                          <p className="text-muted-foreground">Points</p>
                          <p className="font-bold text-foreground">{u.totalPoints}</p>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <p className="text-muted-foreground">Predictions</p>
                          <p className="font-bold text-foreground">{u.predictions}</p>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <p className="text-muted-foreground">Avg/Race</p>
                          <p className="font-bold text-foreground flex items-center gap-1">
                            {u.predictions > 0 ? Math.round(u.totalPoints / u.predictions) : 0}
                            <TrendingUp className="h-3 w-3 text-f1-warning" />
                          </p>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <p className="text-muted-foreground">Role</p>
                          <p className="font-bold text-foreground">{u.role === "admin" ? "Admin" : "User"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPredictions(u)}
                        className="text-xs h-8"
                        title="View all predictions"
                      >
                        <EyeViewIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={u.hidden ? "destructive" : "outline"}
                        onClick={() => handleToggleVisibility(u.id, u.name, u.hidden)}
                        className="text-xs h-8"
                        title={u.hidden ? "Show on leaderboard" : "Hide from leaderboard"}
                      >
                        {u.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      {u.id !== currentUser?.id && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleRole(u.id, u.name)}
                            className="text-xs h-8"
                            title={u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          >
                            {u.role === "admin" ? (
                              <ShieldOff className="h-3 w-3" />
                            ) : (
                              <Shield className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportUserData(u)}
                            className="text-xs h-8"
                            title="Export user data as JSON"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="text-xs h-8"
                            title="Delete user account"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictions Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
        setDialogOpen(isOpen);
        if (!isOpen) {
          setSelectedUserForPredictions(null);
          setUserPredictions([]);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Predictions for {selectedUserForPredictions?.name}</DialogTitle>
            <DialogDescription>
              All predictions submitted by {selectedUserForPredictions?.email} ({selectedUserForPredictions?.predictions} total)
            </DialogDescription>
          </DialogHeader>
          
          {loadingPredictions ? (
            <div className="text-center py-8 text-muted-foreground">Loading predictions...</div>
          ) : userPredictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No predictions found</div>
          ) : (
            <div className="space-y-4">
              {userPredictions.map((pred) => (
                <div key={pred.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{getRaceName(pred.raceId)} ({pred.type})</p>
                      {pred.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(pred.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {pred.score > 0 && (
                      <Badge className="bg-primary/20 text-primary">{pred.score} pts</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-background/30">
                      <p className="text-muted-foreground">P1</p>
                      <p className="font-semibold">{getDriverById(pred.p1)?.name || pred.p1}</p>
                    </div>
                    <div className="p-2 rounded bg-background/30">
                      <p className="text-muted-foreground">P2</p>
                      <p className="font-semibold">{getDriverById(pred.p2)?.name || pred.p2}</p>
                    </div>
                    <div className="p-2 rounded bg-background/30">
                      <p className="text-muted-foreground">P3</p>
                      <p className="font-semibold">{getDriverById(pred.p3)?.name || pred.p3}</p>
                    </div>
                    <div className="p-2 rounded bg-background/30">
                      <p className="text-muted-foreground">Pole</p>
                      <p className="font-semibold">{getDriverById(pred.pole)?.name || pred.pole}</p>
                    </div>
                    <div className="p-2 rounded bg-background/30 col-span-2 sm:col-span-4">
                      <p className="text-muted-foreground">Constructor</p>
                      <p className="font-semibold">{pred.predictedConstructor || "None"}</p>
                    </div>
                  </div>

                  {pred.unexpected && (
                    <div className="p-2 rounded bg-background/30 text-xs">
                      <p className="text-muted-foreground">Unexpected Driver</p>
                      <p className="italic">{pred.unexpected}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersAdvanced;


