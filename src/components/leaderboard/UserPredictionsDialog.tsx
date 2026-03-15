import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { getUserScores, type UserScore } from "@/lib/api/predictions";
import { raceCalendar, isRaceLocked } from "@/lib/data/raceCalendar";
import { LeaderboardEntry } from "@/lib/api/leaderboard";
import { useDrivers } from "@/hooks/useDrivers";
import { Badge } from "@/components/ui/badge";

interface UserPredictionsDialogProps {
  user: LeaderboardEntry | null;
  onClose: () => void;
}

export function UserPredictionsDialog({ user, onClose }: UserPredictionsDialogProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { drivers } = useDrivers();
  
  const getDriverName = (id?: string) => {
    if (!id) return "-";
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : id;
  };

  useEffect(() => {
    if (!user) return;

    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const lockedIds = raceCalendar
          .filter((r) => isRaceLocked(r))
          .map((r) => r.id)
          .join(",");
          
        const res = await apiClient.get<any>(
          `/api/predictions/public/${user.userId}?lockedIds=${lockedIds}`
        );
        if (res.success && res.data) {
          setPredictions(res.data);
        } else {
          setError(res.error || "Failed to load predictions");
        }

        // Also fetch scores to show which predictions earned points
        const scoresData = await getUserScores(user.userId);
        setScores(scoresData);
      } catch (err: any) {
        setError(err.message || "Failed to load predictions");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [user]);

  const getRaceName = (raceId: string) => {
    return raceCalendar.find(r => r.id === raceId)?.raceName || raceId;
  };

  const getScoreForPrediction = (raceId: string, type: string) => {
    return scores.find(s => s.raceId === raceId && s.type === type);
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col bg-card/95 backdrop-blur-md border-primary/20">
        <DialogHeader>
          <DialogTitle className="f1-heading text-xl truncate">
            {user?.username || user?.name}'s Predictions
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
          {loading ? (
             <div className="flex items-center justify-center p-8">
               <Loader className="h-6 w-6 animate-spin text-primary" />
             </div>
          ) : error ? (
             <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
               {error}
             </div>
          ) : predictions.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground text-sm flex items-center justify-center border border-dashed border-border/50 rounded-lg h-32">
               No locked predictions found for this user.
             </div>
          ) : (
            predictions.map((p) => {
              const score = getScoreForPrediction(p.raceWeekendId, p.type);
              return (
                <div key={`${p.raceWeekendId}-${p.type}`} className="glass p-4 rounded-xl space-y-3 border border-border/40 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
                    <span className="font-bold text-sm text-primary">
                      {getRaceName(p.raceWeekendId)}
                    </span>
                    <div className="flex items-center gap-2">
                      {score && (
                        <Badge className="bg-primary/20 text-primary">
                          {score.total} pts
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground uppercase bg-secondary/50 px-2 py-0.5 rounded font-mono">
                        {p.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div className="bg-background/40 rounded-lg p-3">
                      <p className="text-muted-foreground text-xs mb-2 uppercase tracking-wider font-semibold">Qualifying</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Pole</span>
                        <span className={`font-bold ${score?.polePoints ? "text-f1-success" : ""}`}>{getDriverName(p.predictedPole)}</span>
                      </div>
                    </div>
                    <div className="bg-background/40 rounded-lg p-3">
                      <p className="text-muted-foreground text-xs mb-2 uppercase tracking-wider font-semibold">Podium</p>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-f1-gold">P1 🥇</span>
                        <span className={`font-bold ${score?.p1Points ? "text-f1-success" : ""}`}>{getDriverName(p.predictedP1)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-f1-silver">P2 🥈</span>
                        <span className={`font-bold ${score?.p2Points ? "text-f1-success" : ""}`}>{getDriverName(p.predictedP2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-f1-bronze">P3 🥉</span>
                        <span className={`font-bold ${score?.p3Points ? "text-f1-success" : ""}`}>{getDriverName(p.predictedP3)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score breakdown badges */}
                  {score && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {score.p1Points > 0 && <Badge variant="outline" className="text-f1-success border-f1-success/30">P1 +{score.p1Points}</Badge>}
                      {score.p2Points > 0 && <Badge variant="outline" className="text-f1-success border-f1-success/30">P2 +{score.p2Points}</Badge>}
                      {score.p3Points > 0 && <Badge variant="outline" className="text-f1-success border-f1-success/30">P3 +{score.p3Points}</Badge>}
                      {score.polePoints > 0 && <Badge variant="outline" className="text-f1-success border-f1-success/30">Pole +{score.polePoints}</Badge>}
                      {score.podiumBonusPoints > 0 && <Badge variant="outline" className="text-f1-gold border-f1-gold/30">Podium Bonus +{score.podiumBonusPoints}</Badge>}
                      {score.constructorPoints > 0 && <Badge variant="outline" className="text-f1-gold border-f1-gold/30">Constructor +{score.constructorPoints}</Badge>}
                      {score.unexpectedPoints > 0 && <Badge variant="outline" className="text-f1-warning border-f1-warning/30">Unexpected +{score.unexpectedPoints}</Badge>}
                    </div>
                  )}
                  
                  {p.unexpectedStatement && (
                    <div className="mt-3 pt-3 border-t border-border/20">
                      <p className="text-muted-foreground text-xs mb-1 uppercase tracking-wider font-semibold">Bold Prediction</p>
                      <p className="text-sm italic pl-2 border-l-2 border-primary/50 text-foreground/80">"{p.unexpectedStatement}"</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
