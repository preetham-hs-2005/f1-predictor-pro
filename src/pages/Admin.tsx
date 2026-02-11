import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminResults from "@/components/admin/AdminResults";
import AdminPredictions from "@/components/admin/AdminPredictions";
import AdminUsers from "@/components/admin/AdminUsers";
import { Shield, ClipboardList, Users, Trophy } from "lucide-react";

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    else if (user?.role !== "admin") navigate("/dashboard");
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12 max-w-4xl">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="f1-heading text-3xl">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage race results, score predictions, and users
          </p>
        </div>

        <Tabs defaultValue="results" className="animate-slide-up">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="results" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <AdminResults />
          </TabsContent>
          <TabsContent value="predictions">
            <AdminPredictions />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
