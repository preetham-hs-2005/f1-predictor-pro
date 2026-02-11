import { useState } from "react";
import { getAllUsers, toggleUserRole } from "@/lib/data/results";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, ShieldOff } from "lucide-react";

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [, setRefresh] = useState(0);
  const users = getAllUsers();

  const handleToggleRole = (userId: string, currentRole: string) => {
    if (userId === currentUser?.id) {
      toast.error("You can't change your own role");
      return;
    }
    const newRole = toggleUserRole(userId);
    toast.success(`User role changed to ${newRole}`);
    setRefresh((r) => r + 1);
  };

  return (
    <section className="glass rounded-xl p-6">
      <h2 className="f1-heading text-sm text-muted-foreground mb-4">
        Manage Users ({users.length})
      </h2>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No registered users yet.
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((u: any) => (
            <div
              key={u.id}
              className="flex items-center justify-between py-3 px-4 rounded-lg bg-background/30"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{u.name}</span>
                    {u.role === "admin" && (
                      <Badge className="bg-primary/20 text-primary text-[10px]">
                        <Shield className="h-2.5 w-2.5 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {u.id === currentUser?.id && (
                      <Badge variant="outline" className="text-[10px]">You</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold tabular-nums">{u.totalPoints} pts</span>
                {u.id !== currentUser?.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleRole(u.id, u.role)}
                    className="text-xs gap-1"
                  >
                    {u.role === "admin" ? (
                      <>
                        <ShieldOff className="h-3 w-3" />
                        Demote
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3" />
                        Make Admin
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Tip: The first account registered can be promoted to admin here.
        Register a second account or use the browser console to set admin role.
      </p>
    </section>
  );
};

export default AdminUsers;
