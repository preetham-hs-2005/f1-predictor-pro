import { useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, ClipboardList, Database, Settings, Shield, Trophy, Users, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminDataManagement from "@/components/admin/AdminDataManagement";
import AdminDrivers from "@/components/admin/AdminDrivers";
import AdminPredictions from "@/components/admin/AdminPredictions";
import AdminRaces from "@/components/admin/AdminRaces";
import AdminResults from "@/components/admin/AdminResults";
import AdminUsersAdvanced from "@/components/admin/AdminUsersAdvanced";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const modules = [
  { key: "dashboard", label: "Overview", code: "OPS", icon: BarChart3 },
  { key: "races", label: "Calendar", code: "CAL", icon: Calendar },
  { key: "results", label: "Results", code: "RES", icon: Trophy },
  { key: "predictions", label: "Predictions", code: "PRD", icon: ClipboardList },
  { key: "users", label: "Users", code: "USR", icon: Users },
  { key: "drivers", label: "Drivers", code: "DRV", icon: UsersRound },
  { key: "data", label: "Data", code: "DB", icon: Database },
  { key: "settings", label: "Settings", code: "CFG", icon: Settings },
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

  const activeModule = useMemo(() => modules.find((module) => module.key === active) || modules[0], [active]);

  if (isLoading || !user || user.role !== "admin") return null;

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <section className="border border-border bg-surface-1">
          <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="badge-signal">Admin</Badge>
                <span className="data-mono text-[10px] uppercase text-muted-foreground">{user.name}</span>
              </div>
              <h1 className="display mt-3 text-3xl font-bold text-white">Operations Workbench</h1>
            </div>
            <div className="grid grid-cols-4 border border-border bg-background">
              {[
                ["Role", "Admin"],
                ["Modules", modules.length],
                ["User", user.name],
                ["State", "Live"],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 border-r border-border px-4 py-3 last:border-r-0">
                  <p className="label-eyebrow">{label}</p>
                  <p className="data-mono mt-1 truncate text-sm font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border-b border-border">
            <div className="flex min-w-max">
              {modules.map((module) => {
                const Icon = module.icon;
                const selected = active === module.key;
                return (
                  <button
                    key={module.key}
                    onClick={() => setActive(module.key)}
                    className={cn(
                      "flex w-44 items-center gap-3 border-r border-border px-4 py-3 text-left transition-colors hover:bg-surface-2/60",
                      selected && "bg-signal/10 text-white",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", selected ? "text-signal" : "text-muted-foreground")} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{module.label}</p>
                      <p className="data-mono text-[9px] text-muted-foreground">{module.code}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid min-h-[640px] lg:grid-cols-[220px_1fr]">
            <aside className="hidden border-r border-border bg-sidebar/40 p-4 lg:block">
              <p className="label-eyebrow">Current panel</p>
              <p className="display mt-3 text-2xl font-semibold text-white">{activeModule.label}</p>
              <p className="data-mono mt-3 text-[10px] uppercase leading-5 text-muted-foreground">
                Changes are written directly to the backing API. Use with care.
              </p>
            </aside>

            <div className="min-w-0 p-4 sm:p-5">
              {active === "dashboard" && <AdminDashboard />}
              {active === "races" && <AdminRaces />}
              {active === "results" && <AdminResults />}
              {active === "predictions" && <AdminPredictions />}
              {active === "users" && <AdminUsersAdvanced />}
              {active === "drivers" && <AdminDrivers />}
              {active === "data" && <AdminDataManagement />}
              {active === "settings" && (
                <div className="section-card">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-signal" />
                    <h2 className="display text-2xl font-semibold text-white">Settings</h2>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="panel-subtle">
                      <p className="page-eyebrow">Current role</p>
                      <p className="mt-3 text-lg font-semibold text-white">Administrator</p>
                      <p className="mt-1 text-sm text-white/55">{user.name}</p>
                    </div>
                    <div className="panel-subtle">
                      <p className="page-eyebrow">Email</p>
                      <p className="mt-3 truncate text-lg font-semibold text-white">{user.email}</p>
                      <p className="mt-1 text-sm text-white/55">Account email</p>
                    </div>
                    <div className="panel-subtle">
                      <p className="page-eyebrow">System health</p>
                      <p className="mt-3 text-lg font-semibold text-white">Operational</p>
                      <p className="mt-1 text-sm text-white/55">Database and scoring are active</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
};

export default Admin;
