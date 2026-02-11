import { useState } from "react";
import { raceCalendar } from "@/lib/data/raceCalendar";
import { getDriverById } from "@/lib/data/drivers";
import {
  getRacePredictions,
  getStoredScores,
  awardUnexpectedPoints,
  removeUnexpectedPoints,
  getResult,
} from "@/lib/data/results";
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
  const [selectedRace, setSelectedRace] = useState("");
  const [predType, setPredType] = useState<"race" | "sprint">("race");
  const [, setRefresh] = useState(0);

  const race = raceCalendar.find((r) => r.id === selectedRace);
  const predictions = selectedRace ? getRacePredictions(selectedRace, predType) : [];
  const result = selectedRace ? getResult(selectedRace, predType) : null;
  const scores = getStoredScores();

  // Get stored users for name lookup
  const getUsername = (userId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem("f1_users") || "[]");
      return users.find((u: any) => u.id === userId)?.name || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const getDriverName = (id: string) => getDriverById(id)?.name || id;

  const getUserScore = (userId: string) =>
    scores.find(
      (s) => s.userId === userId && s.raceId === selectedRace && s.type === predType
    );

  const handleAwardUnexpected = (userId: string) => {
    awardUnexpectedPoints(userId, selectedRace, predType);
    toast.success("Unexpected points awarded!");
    setRefresh((r) => r + 1);
  };

  const handleRemoveUnexpected = (userId: string) => {
    removeUnexpectedPoints(userId, selectedRace, predType);
    toast.success("Unexpected points removed");
    setRefresh((r) => r + 1);
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-xl p-6">
        <h2 className="f1-heading text-sm text-muted-foreground mb-4">View Predictions</h2>

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

        {!result && selectedRace && (
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
                    <span className="font-semibold text-sm">{getUsername(pred.userId)}</span>
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
                      {score.unexpectedPoints > 0 && <Badge variant="outline" className="text-f1-warning border-f1-warning/30">Unexpected +{score.unexpectedPoints}</Badge>}
                    </div>
                  )}

                  {/* Unexpected award controls */}
                  {result && score && (
                    <div className="flex gap-2">
                      {score.unexpectedPoints === 0 ? (
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
      </section>
    </div>
  );
};

export default AdminPredictions;
