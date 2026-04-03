import { useEffect } from "react";
import { BarChart3, Calendar, ClipboardList, Database, Settings, Shield, Trophy, Users, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminDataManagement from "@/components/admin/AdminDataManagement";
import AdminDrivers from "@/components/admin/AdminDrivers";
import AdminPredictions from "@/components/admin/AdminPredictions";
import AdminRaces from "@/components/admin/AdminRaces";
import AdminResults from "@/components/admin/AdminResults";
import AdminUsersAdvanced from "@/components/admin/AdminUsersAdvanced";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

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
    <PageShell>
      <Navbar />
      <main className="container max-w-7xl pb-12 pt-28 md:pt-32">
        <PageHeader
          eyebrow="Restricted area"
          title="Admin control center"
          description="Manage races, predictions, users, and system data inside the same upgraded design language while keeping the existing operational tooling."
          badge="Administrator"
          stats={[
            { label: "Role", value: "Admin" },
            { label: "User", value: user.name },
            { label: "Modules", value: "8" },
            { label: "Status", value: "Operational" },
          ]}
        />

        <Tabs defaultValue="dashboard" className="mt-8 animate-slide-up">
          <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
            <TabsTrigger value="dashboard" className="gap-2 text-xs md:text-sm">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="races" className="gap-2 text-xs md:text-sm">
              <Calendar className="h-4 w-4" />
              Races
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2 text-xs md:text-sm">
              <Trophy className="h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-2 text-xs md:text-sm">
              <ClipboardList className="h-4 w-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 text-xs md:text-sm">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-2 text-xs md:text-sm">
              <UsersRound className="h-4 w-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2 text-xs md:text-sm">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 text-xs md:text-sm">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          <TabsContent value="races">
            <AdminRaces />
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
            <div className="section-card">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-2xl text-white">Admin settings</h2>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="panel-subtle">
                  <p className="page-eyebrow">Current role</p>
                  <p className="mt-3 text-lg font-semibold text-white">Administrator</p>
                  <p className="mt-1 text-sm text-white/55">{user.name}</p>
                </div>
                <div className="panel-subtle">
                  <p className="page-eyebrow">Email</p>
                  <p className="mt-3 text-lg font-semibold text-white">{user.email}</p>
                  <p className="mt-1 text-sm text-white/55">Primary operator contact</p>
                </div>
                <div className="panel-subtle">
                  <p className="page-eyebrow">System health</p>
                  <p className="mt-3 text-lg font-semibold text-white">All systems operational</p>
                  <p className="mt-1 text-sm text-white/55">Database, scoring, and security active</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </PageShell>
  );
};

export default Admin;
