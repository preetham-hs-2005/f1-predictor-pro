import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Upload, Trash2, Database, AlertCircle, Loader2 } from "lucide-react";
import { getDatabaseStats, exportDatabase, importDatabase, clearDatabase } from "@/lib/api/admin";

const AdminDataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await getDatabaseStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const exportResponse = await exportDatabase();

      const dataStr = JSON.stringify(exportResponse, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `f1-predictor-mongodb-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Database backup exported successfully!");
    } catch (error) {
      toast.error("Failed to export backup");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const backup = JSON.parse(content);

        if (!backup.data || !backup.exportDate) {
          throw new Error("Invalid backup format");
        }

        // Validate before import
        const collections = Object.keys(backup.data);
        if (collections.length === 0) {
          throw new Error("No data found in backup");
        }

        // Ask for confirmation
        if (
          confirm(
            `This will import data for ${collections.length} collections.\n\nWARNING: This will overwrite EVERYTHING. Are you sure?`
          )
        ) {
          toast.loading("Restoring database...", { id: "import" });
          
          const success = await importDatabase(backup);
          
          if (success) {
            toast.success("Database restored from backup!", { id: "import" });
            await loadStats();
          } else {
            throw new Error("Failed to clear database");
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to import backup";
        toast.error(msg, { id: "import" });
      } finally {
        setIsImporting(false);
        // Reset file input
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    if (
      confirm(
        "⚠️ WARNING: This will permanently delete ALL data including users, predictions, results, and scores from MongoDB. This cannot be undone!\n\nType 'DELETE' to confirm."
      )
    ) {
      const confirmation = prompt("Type 'DELETE' to confirm permanent collection drop:");
      if (confirmation === "DELETE") {
        try {
          toast.loading("Wiping Collections...", { id: "clear" });
          await clearDatabase();
          toast.success("All data has been cleared from MongoDB", { id: "clear" });
          await loadStats();
        } catch (error) {
          toast.error("Failed to clear data", { id: "clear" });
        }
      } else {
        toast.error("Deletion cancelled");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Overview
          </CardTitle>
          <CardDescription>Current storage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Users</p>
                <p className="text-2xl font-bold f1-heading">{stats?.documentCounts?.users || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Predictions</p>
                <p className="text-2xl font-bold f1-heading">{stats?.documentCounts?.predictions || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Race Results</p>
                <p className="text-2xl font-bold f1-heading">{stats?.documentCounts?.results || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50 md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Score Entries</p>
                <p className="text-2xl font-bold f1-heading">{stats?.documentCounts?.scores || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">MongoDB Storage Used</p>
                <p className="text-2xl font-bold f1-heading text-primary">{stats?.storageSizeKB || 0} KB</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-base">Backup & Restore</CardTitle>
          <CardDescription>Download or restore database backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={handleExportAll}
              disabled={isExporting}
              className="w-full gap-2"
              size="lg"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Database Backup"}
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                disabled={isImporting}
                className="hidden"
                id="backup-import"
              />
              <Button
                onClick={() => document.getElementById("backup-import")?.click()}
                disabled={isImporting}
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? "Importing..." : "Import Backup File"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              💡 Backups include all users, predictions, results, and scores. Store them safely!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Destructive Actions */}
      <Card className="glass border-0 border-red-500/20 bg-red-950/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible operations - use with caution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={handleClearAllData}
              variant="destructive"
              className="w-full gap-2"
              size="lg"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
            <p className="text-xs text-red-400/80 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>This permanently deletes all data. Export a backup first!</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDataManagement;
