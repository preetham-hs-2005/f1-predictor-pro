import { useEffect, useMemo, useState } from "react";
import { getAdminStats, type AdminStats } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, TrendingUp, Target } from "lucide-react";

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getAdminStats();
    setStatsData(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl p-6 animate-pulse h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="glass rounded-xl p-6">
        <p className="text-muted-foreground">Failed to load admin statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Total Users</span>
              <Users className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold f1-heading">{statsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Managing community</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Admin Accounts</span>
              <Trophy className="h-4 w-4 text-f1-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold f1-heading">{statsData.adminCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Administrators</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Predictions</span>
              <TrendingUp className="h-4 w-4 text-f1-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold f1-heading">{statsData.totalPredictions}</div>
            <p className="text-xs text-muted-foreground mt-1">Total submitted</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Race Results</span>
              <Target className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold f1-heading">{statsData.totalResults}</div>
            <p className="text-xs text-muted-foreground mt-1">Entered</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base">Top Predictors</CardTitle>
          <CardDescription>Leading users by points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statsData.topUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
            ) : (
              statsData.topUsers.map((user, idx) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="shrink-0 bg-primary/20 text-primary border-primary/50">
                      #{idx + 1}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums">{user.totalPoints}pts</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base">Database Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Total Predictions</p>
              <p className="text-2xl font-bold f1-heading">{statsData.totalPredictions}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Scores Recorded</p>
              <p className="text-2xl font-bold f1-heading">{statsData.totalScores}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Regular Users</p>
              <p className="text-2xl font-bold f1-heading">{statsData.regularUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
