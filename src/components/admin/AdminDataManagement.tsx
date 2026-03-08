import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Upload, Trash2, Database, AlertCircle } from "lucide-react";

const AdminDataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const getStorageSize = () => {
    let total = 0;
    const keys = ["f1_users", "f1_predictions", "f1_results", "f1_scores"];
    keys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) total += item.length;
    });
    return (total / 1024).toFixed(2); // in KB
  };

  const getDataCounts = () => {
    try {
      const users = JSON.parse(localStorage.getItem("f1_users") || "[]");
      const predictions = JSON.parse(localStorage.getItem("f1_predictions") || "[]");
      const results = JSON.parse(localStorage.getItem("f1_results") || "[]");
      const scores = JSON.parse(localStorage.getItem("f1_scores") || "[]");

      return {
        users: users.length,
        predictions: predictions.length,
        results: results.length,
        scores: scores.length,
      };
    } catch {
      return { users: 0, predictions: 0, results: 0, scores: 0 };
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {
          users: JSON.parse(localStorage.getItem("f1_users") || "[]"),
          predictions: JSON.parse(localStorage.getItem("f1_predictions") || "[]"),
          results: JSON.parse(localStorage.getItem("f1_results") || "[]"),
          scores: JSON.parse(localStorage.getItem("f1_scores") || "[]"),
        },
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `f1-predictor-backup-${new Date().toISOString().split("T")[0]}.json`;
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
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backup = JSON.parse(content);

        if (!backup.data || !backup.exportDate) {
          throw new Error("Invalid backup format");
        }

        // Validate before import
        const { users, predictions, results, scores } = backup.data;
        if (!Array.isArray(users) || !Array.isArray(predictions) || !Array.isArray(results) || !Array.isArray(scores)) {
          throw new Error("Invalid data structure in backup");
        }

        // Ask for confirmation
        if (
          confirm(
            `This will import:\n- ${users.length} users\n- ${predictions.length} predictions\n- ${results.length} results\n- ${scores.length} scores\n\nThis will overwrite existing data. Continue?`
          )
        ) {
          localStorage.setItem("f1_users", JSON.stringify(users));
          localStorage.setItem("f1_predictions", JSON.stringify(predictions));
          localStorage.setItem("f1_results", JSON.stringify(results));
          localStorage.setItem("f1_scores", JSON.stringify(scores));

          toast.success("Database restored from backup!");
          window.location.reload();
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to import backup";
        toast.error(msg);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (
      confirm(
        "⚠️ WARNING: This will permanently delete ALL data including users, predictions, results, and scores. This cannot be undone!\n\nType 'DELETE' to confirm."
      )
    ) {
      const confirmation = prompt("Type 'DELETE' to confirm permanent deletion:");
      if (confirmation === "DELETE") {
        try {
          localStorage.removeItem("f1_users");
          localStorage.removeItem("f1_predictions");
          localStorage.removeItem("f1_results");
          localStorage.removeItem("f1_scores");
          toast.success("All data has been cleared");
          window.location.reload();
        } catch (error) {
          toast.error("Failed to clear data");
        }
      } else {
        toast.error("Deletion cancelled");
      }
    }
  };

  const counts = getDataCounts();
  const size = getStorageSize();

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Users</p>
              <p className="text-2xl font-bold f1-heading">{counts.users}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Predictions</p>
              <p className="text-2xl font-bold f1-heading">{counts.predictions}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Race Results</p>
              <p className="text-2xl font-bold f1-heading">{counts.results}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50 md:col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Score Entries</p>
              <p className="text-2xl font-bold f1-heading">{counts.scores}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Storage Used</p>
              <p className="text-2xl font-bold f1-heading text-blue-400">{size}KB</p>
            </div>
          </div>
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
