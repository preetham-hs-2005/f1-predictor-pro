import { useState, useEffect, useMemo } from "react";
import { raceCalendar } from "@/lib/data/raceCalendar";
import { useDrivers } from "@/hooks/useDrivers";
import { getAdminPredictions, getAdminScores, type AdminPrediction, type ScoreEntry, awardUnexpectedPoints, revokeUnexpectedPoints } from "@/lib/api/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Zap, Award, X } from "lucide-react";

const AdminPredictions = () => {
  const { getDriverById } = useDrivers(true);
  const [selectedRace, setSelectedRace] = useState("");
  const [predType, setPredType] = useState<"race" | "sprint">("race");
  const [allPredictions, setAllPredictions] = useState<AdminPrediction[]>([]);
  const [allScores, setAllScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [predictions, scores] = await Promise.all([
      getAdminPredictions(),
      getAdminScores(),
    ]);
    setAllPredictions(predictions);
    setAllScores(scores);
    setLoading(false);
  };

  const race = raceCalendar.find((r) => r.id === selectedRace);

  const predictions = useMemo(() => {
    if (!selectedRace) return [];
    return allPredictions.filter((p) => p.raceId === selectedRace && p.type === predType);
  }, [allPredictions, selectedRace, predType]);

  const scores = useMemo(() => {
    if (!selectedRace) return [];
    return allScores.filter((s) => s.raceId === selectedRace && s.type === predType);
  }, [allScores, selectedRace, predType]);

  const getDriverName = (id: string) => getDriverById(id)?.name || id;

  const getUserScore = (userId: string) =>
    scores.find((s) => s.userId === userId);

  const handleAwardUnexpected = async (userId: string) => {
    if (!selectedRace) return;
    try {
      // Optimistically update the score in the UI
      const existingScoreIndex = allScores.findIndex(s => 
        s.userId === userId && s.raceId === selectedRace && s.type === predType
      );

      let updatedScores;
      if (existingScoreIndex >= 0) {
        // Score exists, update it
        updatedScores = allScores.map((s, idx) => 
          idx === existingScoreIndex
            ? { ...s, unexpectedPoints: 15, total: s.total - (s.unexpectedPoints || 0) + 15 }
            : s
        );
      } else {
        // Score doesn't exist, create optimistic entry
        updatedScores = [...allScores, {
          userId,
          raceId: selectedRace,
          type: predType,
          p1Points: 0,
          p2Points: 0,
          p3Points: 0,
          polePoints: 0,
          podiumBonusPoints: 0,
          constructorPoints: 0,
          unexpectedPoints: 15,
          total: 15,
        }];
      }
      setAllScores(updatedScores);
      
      const success = await awardUnexpectedPoints(userId, selectedRace, predType);
      if (!success) {
        // Revert optimistic update on failure
        toast.error("Failed to award points - reverting");
        await loadData();
      } else {
        toast.success("Unexpected statement points awarded!");
      }
    } catch (error) {
      toast.error("Error awarding points");
      console.error("Award error:", error);
      // Revert on error
      await loadData();
    }
  };

  const handleRemoveUnexpected = async (userId: string) => {
    if (!selectedRace) return;
    try {
      // Optimistically update the score in the UI
      const existingScoreIndex = allScores.findIndex(s => 
        s.userId === userId && s.raceId === selectedRace && s.type === predType
      );

      if (existingScoreIndex >= 0) {
        const updatedScores = allScores.map((s, idx) => 
          idx === existingScoreIndex
            ? { ...s, unexpectedPoints: 0, total: s.total - (s.unexpectedPoints || 0) }
            : s
        );
        setAllScores(updatedScores);
      }
      
      const success = await revokeUnexpectedPoints(userId, selectedRace, predType);
      if (!success) {
        // Revert optimistic update on failure
        toast.error("Failed to revoke points - reverting");
        await loadData();
      } else {
        toast.success("Unexpected statement points revoked!");
      }
    } catch (error) {
      toast.error("Error revoking points");
      console.error("Revoke error:", error);
      // Revert on error
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-xl p-6">
        <h2 className="f1-heading text-sm text-muted-foreground mb-4">View Predictions</h2>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading MongoDB predictions...</div>
        ) : (
          <>
            <div className="flex gap-3 mb-4">
              <Select value={selectedRace} onValueChange={(v) => { setSelectedRace(v); setPredType("race"); }}>
                <SelectTrigger className="bg-background/50 flex-1">
                  <SelectValue placeholder="Select a race" />
                </SelectTrigger>
                <SelectContent>
                  {raceCalendar.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.countryFlag} R{r.round} · {r.raceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>



        {race?.sprintWeekend && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPredType("race")}
              className={`px-4 py-2 rounded-lg text-sm f1-heading transition-all ${
                predType === "race"
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              Grand Prix
            </button>
            <button
              onClick={() => setPredType("sprint")}
              className={`px-4 py-2 rounded-lg text-sm f1-heading transition-all ${
                predType === "sprint"
                  ? "bg-f1-warning/20 text-f1-warning border border-f1-warning/50"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-3 w-3 inline mr-1" />
              Sprint
            </button>
          </div>
        )}

        {scores.length === 0 && selectedRace && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Results not entered yet — enter results first to see scores.
          </p>
        )}

        {predictions.length === 0 && selectedRace && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No predictions submitted for this race.
          </p>
        )}

        {predictions.length > 0 && (
          <div className="space-y-3">
            {predictions.map((pred) => {
              const score = getUserScore(pred.userId);
              return (
                <div
                  key={pred.userId}
                  className="bg-background/30 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{pred.userName}</span>
                    {score && (
                      <Badge className="bg-primary/20 text-primary">
                        {score.total} pts
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">P1:</span>{" "}
                      <span className={score?.p1Points ? "text-f1-success" : ""}>
                        {getDriverName(pred.p1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P2:</span>{" "}
                      <span className={score?.p2Points ? "text-f1-success" : ""}>
                        {getDriverName(pred.p2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P3:</span>{" "}
                      <span className={score?.p3Points ? "text-f1-success" : ""}>
                        {getDriverName(pred.p3)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pole:</span>{" "}
                      <span className={score?.polePoints ? "text-f1-success" : ""}>
                        {getDriverName(pred.pole)}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-4 mt-1">
                      <span className="text-muted-foreground">Constructor:</span>{" "}
                      <span className={score?.constructorPoints ? "text-f1-success" : ""}>
                        {pred.predictedConstructor || "None"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-muted-foreground">Unexpected:</span>{" "}
                    <span className="italic">"{pred.unexpected}"</span>
                  </div>

                  {/* Score breakdown */}
                  {score && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {score.p1Points > 0 && <Badge variant="outline" className="text-f1-success border-f1-success/30">P1 +{score.p1Points}</Badge>}
                      {score.p2Points > 0 && <Badge variant="outline" className="text-f1-success border-f1-success/30">P2 +{score.p2Points}</Badge>}
                      {score.p3Points > 0 && <Badge variant="outline" className="text-f1-success border-f1-success/30">P3 +{score.p3Points}</Badge>}
                      {score.polePoints > 0 && <Badge variant="outline" className="text-f1-success border-f1-success/30">Pole +{score.polePoints}</Badge>}
                      {score.podiumBonusPoints > 0 && <Badge variant="outline" className="text-f1-gold border-f1-gold/30">Podium Bonus +{score.podiumBonusPoints}</Badge>}
                      {score.constructorPoints > 0 && <Badge variant="outline" className="text-f1-gold border-f1-gold/30">Constructor +{score.constructorPoints}</Badge>}
                      {score.unexpectedPoints > 0 && <Badge variant="outline" className="text-f1-warning border-f1-warning/30">Unexpected +{score.unexpectedPoints}</Badge>}
                    </div>
                  )}

                  {/* Unexpected award controls - show for all predictions if race has results */}
                  {selectedRace && scores.length > 0 && (
                    <div className="flex gap-2">
                      {!score || score.unexpectedPoints === 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAwardUnexpected(pred.userId)}
                          className="text-xs gap-1"
                        >
                          <Award className="h-3 w-3" />
                          Award Unexpected
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveUnexpected(pred.userId)}
                          className="text-xs gap-1 text-destructive"
                        >
                          <X className="h-3 w-3" />
                          Revoke Unexpected
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminPredictions;
