import { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

const modules = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "races", label: "Races", icon: Calendar },
  { key: "results", label: "Results", icon: Trophy },
  { key: "predictions", label: "Predictions", icon: ClipboardList },
  { key: "users", label: "Users", icon: Users },
  { key: "drivers", label: "Drivers", icon: UsersRound },
  { key: "data", label: "Data", icon: Database },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [active, setActive] = useState<(typeof modules)[number]["key"]>("dashboard");
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
        <PageHeader eyebrow="Admin" title="Control center" badge="Admin" stats={[{ label: "Role", value: "Admin" }, { label: "User", value: user.name }, { label: "Modules", value: "8" }, { label: "Status", value: "Operational" }]} />
        <section className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="section-card h-fit p-3">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <button key={m.key} onClick={() => setActive(m.key)} className={`mb-2 flex w-full items-center gap-3 px-3 py-2 text-left ${active === m.key ? "bg-signal/15 text-white" : "text-muted-foreground hover:bg-surface-2/60"}`}>
                  <Icon className="h-4 w-4" /> {m.label}
                </button>
              );
            })}
          </aside>
          <div>
            {active === "dashboard" && <AdminDashboard />}
            {active === "races" && <AdminRaces />}
            {active === "results" && <AdminResults />}
            {active === "predictions" && <AdminPredictions />}
            {active === "users" && <AdminUsersAdvanced />}
            {active === "drivers" && <AdminDrivers />}
            {active === "data" && <AdminDataManagement />}
            {active === "settings" && (
              <div className="section-card">
                <div className="flex items-center gap-3"><Shield className="h-6 w-6 text-primary" /><h2 className="text-2xl font-semibold text-white">Settings</h2></div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="panel-subtle"><p className="page-eyebrow">Current role</p><p className="mt-3 text-lg font-semibold text-white">Administrator</p><p className="mt-1 text-sm text-white/55">{user.name}</p></div>
                  <div className="panel-subtle"><p className="page-eyebrow">Email</p><p className="mt-3 text-lg font-semibold text-white">{user.email}</p><p className="mt-1 text-sm text-white/55">Account email</p></div>
                  <div className="panel-subtle"><p className="page-eyebrow">System health</p><p className="mt-3 text-lg font-semibold text-white">Operational</p><p className="mt-1 text-sm text-white/55">Database and scoring are active</p></div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
};

export default Admin;
