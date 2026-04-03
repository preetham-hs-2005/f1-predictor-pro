import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { type RaceWeekend } from "@/lib/data/raceCalendar";
import { useDrivers } from "@/hooks/useDrivers";
import { submitPrediction, getUserPrediction } from "@/lib/api/predictions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PredictionFormProps {
  race: RaceWeekend;
  type: "sprint" | "race";
  locked: boolean;
}

const PredictionForm = ({ race, type, locked }: PredictionFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [pole, setPole] = useState("");
  const [constructor, setConstructor] = useState("");
  const [unexpected, setUnexpected] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const { drivers, isLoading: loadingDrivers } = useDrivers();
  const teamsWithColors = Array.from(new Set(drivers.map((d) => d.team)))
    .sort()
    .map((team) => {
      const driver = drivers.find((d) => d.team === team);
      return { team, color: driver?.teamColor || "#FFFFFF" };
    });

  const isSprint = type === "sprint";
  const pointMultiplier = isSprint ? 0.5 : 1;

  useEffect(() => {
    const loadPrediction = async () => {
      if (!user) return;

      try {
        setInitializing(true);
        const prediction = await getUserPrediction(race.id, type);
        setP1(prediction.predictedP1);
        setP2(prediction.predictedP2);
        setP3(prediction.predictedP3);
        setPole(prediction.predictedPole);
        setConstructor(prediction.predictedConstructor || "");
        setUnexpected(prediction.unexpectedStatement);
      } catch {
        // No existing prediction
      } finally {
        setInitializing(false);
      }
    };

    loadPrediction();
  }, [race.id, type, user]);

  const canSubmit = p1 && p2 && p3 && pole && constructor && unexpected.length >= 10 && !locked && !loading;

  const handleSubmit = async () => {
    if (!user) return;

    const podium = [p1, p2, p3];
    if (new Set(podium).size !== 3) {
      toast.error("Each podium position must be a different driver");
      return;
    }

    if (unexpected.length < 10 || unexpected.length > 200) {
      toast.error("Unexpected prediction must be 10-200 characters");
      return;
    }

    try {
      setLoading(true);
      await submitPrediction({
        raceWeekendId: race.id,
        type,
        predictedP1: p1,
        predictedP2: p2,
        predictedP3: p3,
        predictedPole: pole,
        predictedConstructor: constructor,
        unexpectedStatement: unexpected,
      });

      toast.success(`${isSprint ? "Sprint" : "Race"} prediction submitted!`);
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit prediction";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing || loadingDrivers) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <section className="glass mb-6 rounded-xl p-4 sm:p-6 animate-slide-up">
        <h2 className="f1-heading mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4 text-f1-gold" />
          Podium Prediction
        </h2>

        <div className="mb-6 grid gap-3 sm:grid-cols-3 sm:items-end">
          <div className="order-2 flex w-full flex-col items-center sm:order-1 sm:max-w-[180px]">
            <span className="f1-heading mb-2 text-xs text-muted-foreground">P2</span>
            <div className="glass podium-silver flex h-28 w-full items-center justify-center rounded-lg border-2 p-2 sm:h-40">
              <Select value={p2} onValueChange={setP2} disabled={locked}>
                <SelectTrigger className="border-none bg-transparent text-center">
                  <SelectValue placeholder="Select P2" />
                </SelectTrigger>
                <SelectContent>
                  {drivers
                    .filter((d) => d.id !== p1 && d.id !== p3)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.teamColor }} />
                          {d.name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="order-1 flex w-full flex-col items-center sm:order-2 sm:max-w-[200px]">
            <span className="f1-heading mb-2 text-xs text-muted-foreground">P1</span>
            <div className="glass podium-gold flex h-32 w-full items-center justify-center rounded-lg border-2 p-2 sm:h-52">
              <Select value={p1} onValueChange={setP1} disabled={locked}>
                <SelectTrigger className="border-none bg-transparent text-center">
                  <SelectValue placeholder="Select P1" />
                </SelectTrigger>
                <SelectContent>
                  {drivers
                    .filter((d) => d.id !== p2 && d.id !== p3)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.teamColor }} />
                          {d.name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="order-3 flex w-full flex-col items-center sm:max-w-[180px]">
            <span className="f1-heading mb-2 text-xs text-muted-foreground">P3</span>
            <div className="glass podium-bronze flex h-24 w-full items-center justify-center rounded-lg border-2 p-2 sm:h-32">
              <Select value={p3} onValueChange={setP3} disabled={locked}>
                <SelectTrigger className="border-none bg-transparent text-center">
                  <SelectValue placeholder="Select P3" />
                </SelectTrigger>
                <SelectContent>
                  {drivers
                    .filter((d) => d.id !== p1 && d.id !== p2)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.teamColor }} />
                          {d.name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-center text-xs text-muted-foreground">
          <span>P1: {25 * pointMultiplier}pts</span>
          <span>P2: {20 * pointMultiplier}pts</span>
          <span>P3: {15 * pointMultiplier}pts</span>
          <span>Exact podium: +{20 * pointMultiplier}pts</span>
        </div>
      </section>

      <section className="glass mb-6 rounded-xl p-4 sm:p-6 animate-slide-up">
        <Label className="f1-heading mb-3 block text-sm text-muted-foreground">
          {isSprint ? "Sprint Pole" : "Pole Position"} • {10 * pointMultiplier}pts
        </Label>
        <Select value={pole} onValueChange={setPole} disabled={locked}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Select pole position" />
          </SelectTrigger>
          <SelectContent>
            {drivers.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.teamColor }} />
                  #{d.number} {d.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="glass mb-6 rounded-xl p-4 sm:p-6 animate-slide-up">
        <Label className="f1-heading mb-3 block text-sm text-muted-foreground">
          Highest Scoring Constructor • {10 * pointMultiplier}pts
        </Label>
        <Select value={constructor} onValueChange={setConstructor} disabled={locked}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {teamsWithColors.map((t) => (
              <SelectItem key={t.team} value={t.team}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.team}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="glass mb-8 rounded-xl p-4 sm:p-6 animate-slide-up">
        <Label className="f1-heading mb-3 block text-sm text-muted-foreground">
          Expect the Unexpected • {15 * pointMultiplier}pts
        </Label>
        <Textarea
          placeholder="e.g., Albon will finish in top 5, Hamilton and Verstappen will both DNF"
          value={unexpected}
          onChange={(e) => setUnexpected(e.target.value.slice(0, 200))}
          disabled={locked}
          className="h-24 resize-none bg-background/50"
        />
        <p className="mt-2 text-right text-xs text-muted-foreground">{unexpected.length}/200</p>
      </section>

      {!locked && !canSubmit && (
        <div className="mb-4 space-y-1 text-xs text-muted-foreground">
          {!p1 && <p className="text-f1-warning">• Select a driver for P1</p>}
          {!p2 && <p className="text-f1-warning">• Select a driver for P2</p>}
          {!p3 && <p className="text-f1-warning">• Select a driver for P3</p>}
          {!pole && <p className="text-f1-warning">• Select pole position</p>}
          {!constructor && <p className="text-f1-warning">• Select a constructor</p>}
          {unexpected.length < 10 && (
            <p className="text-f1-warning">• Unexpected prediction needs at least 10 characters ({unexpected.length}/10)</p>
          )}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full" size="lg">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {locked ? "Predictions Locked" : loading ? "Submitting..." : `Submit ${isSprint ? "Sprint" : "Race"} Prediction`}
      </Button>
    </>
  );
};

export default PredictionForm;
