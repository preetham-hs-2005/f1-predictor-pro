import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminResults from "@/components/admin/AdminResults";
import AdminPredictions from "@/components/admin/AdminPredictions";
import AdminUsersAdvanced from "@/components/admin/AdminUsersAdvanced";
import AdminDataManagement from "@/components/admin/AdminDataManagement";
import AdminDrivers from "@/components/admin/AdminDrivers";
import { Shield, ClipboardList, Users, Trophy, BarChart3, Settings, Database, UsersRound } from "lucide-react";

const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) navigate("/login");
    else if (user?.role !== "admin") navigate("/dashboard");
  }, [isAuthenticated, user, navigate, isLoading]);

  if (isLoading || !user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12 max-w-6xl">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="f1-heading text-3xl">Admin Control Center</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage races, predictions, users, and system data with full admin powers
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="animate-slide-up">
          <TabsList className="w-full grid grid-cols-3 md:grid-cols-6 mb-6 h-auto p-1">
            <TabsTrigger value="dashboard" className="gap-1 text-xs md:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden min-[640px]:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-1 text-xs md:text-sm">
              <Trophy className="h-4 w-4" />
              <span className="hidden min-[640px]:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-1 text-xs md:text-sm">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden min-[640px]:inline">Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1 text-xs md:text-sm">
              <Users className="h-4 w-4" />
              <span className="hidden min-[640px]:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-1 text-xs md:text-sm">
              <UsersRound className="h-4 w-4" />
              <span className="hidden min-[640px]:inline">Drivers</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1 text-xs md:text-sm">
              <Database className="h-4 w-4" />
              <span className="hidden min-[640px]:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1 text-xs md:text-sm">
              <Settings className="h-4 w-4" />
              <span className="hidden min-[640px]:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          <TabsContent value="results">
            <AdminResults />
          </TabsContent>
          <TabsContent value="predictions">
            <AdminPredictions />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsersAdvanced />
          </TabsContent>
          <TabsContent value="drivers">
            <AdminDrivers />
          </TabsContent>
          <TabsContent value="data">
            <AdminDataManagement />
          </TabsContent>
          <TabsContent value="settings">
            <div className="glass rounded-xl p-6">
              <h2 className="f1-heading text-base mb-4">Admin Settings</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                  <h3 className="text-sm font-semibold mb-2">System Information</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>💻 Current Role: <span className="text-foreground font-semibold">Administrator</span></p>
                    <p>👤 User: <span className="text-foreground font-semibold">{user.name}</span></p>
                    <p>📧 Email: <span className="text-foreground font-semibold">{user.email}</span></p>
                    <p>📅 Last Login: <span className="text-foreground">Today</span></p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                  <h3 className="text-sm font-semibold mb-2">Quick Stats</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>⚡ All systems operational</p>
                    <p>✅ Database connected</p>
                    <p>🔐 Security: Active</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-500/20">
                  <h3 className="text-sm font-semibold mb-2 text-blue-400">Admin Tips</h3>
                  <ul className="space-y-1 text-xs text-blue-300/80 list-disc pl-4">
                    <li>Use Dashboard to monitor overall system health</li>
                    <li>Enter race results to automatically score all predictions</li>
                    <li>Advanced Users tab has search, filtering, and bulk export</li>
                    <li>Regularly backup your data from the Data Management tab</li>
                    <li>Only admins can modify user roles and delete accounts</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
