import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { type RaceWeekend } from "@/lib/data/raceCalendar";
import { drivers } from "@/lib/data/drivers";
import { submitPrediction, getUserPrediction } from "@/lib/api/predictions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [unexpected, setUnexpected] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const isSprint = type === "sprint";
  const pointMultiplier = isSprint ? 0.5 : 1;

  // Load existing prediction from API
  useEffect(() => {
    const loadPrediction = async () => {
      if (!user) return;

      try {
        setInitializing(true);
        const prediction = await getUserPrediction(race.id);
        setP1(prediction.predictedP1);
        setP2(prediction.predictedP2);
        setP3(prediction.predictedP3);
        setPole(prediction.predictedPole);
        setUnexpected(prediction.unexpectedStatement);
      } catch {
        // No existing prediction, form stays empty
      } finally {
        setInitializing(false);
      }
    };

    loadPrediction();
  }, [race.id, user]);

  const canSubmit =
    p1 && p2 && p3 && pole && unexpected.length >= 10 && !locked && !loading;

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
        predictedP1: p1,
        predictedP2: p2,
        predictedP3: p3,
        predictedPole: pole,
        unexpectedStatement: unexpected,
      });

      toast.success(
        `${isSprint ? "Sprint" : "Race"} prediction submitted!`
      );
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit prediction";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Podium prediction */}
      <section className="glass rounded-xl p-6 mb-6 animate-slide-up">
        <h2 className="f1-heading text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-f1-gold" />
          Podium Prediction
        </h2>

        <div className="flex items-end justify-center gap-3 mb-6">
          {/* P2 - Silver */}
          <div className="flex flex-col items-center w-full max-w-[180px]">
            <span className="text-xs text-muted-foreground mb-2 f1-heading">
              P2
            </span>
            <div className="w-full h-40 glass rounded-lg flex items-center justify-center podium-silver border-2 p-2">
              <Select value={p2} onValueChange={setP2} disabled={locked}>
                <SelectTrigger className="bg-transparent border-none text-center">
                  <SelectValue placeholder="Select P2" />
                </SelectTrigger>
                <SelectContent>
                  {drivers
                    .filter((d) => d.id !== p1 && d.id !== p3)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: d.teamColor }}
                          />
                          {d.name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* P1 - Gold */}
          <div className="flex flex-col items-center w-full max-w-[200px]">
            <span className="text-xs text-muted-foreground mb-2 f1-heading">
              P1
            </span>
            <div className="w-full h-52 glass rounded-lg flex items-center justify-center podium-gold border-2 p-2">
              <Select value={p1} onValueChange={setP1} disabled={locked}>
                <SelectTrigger className="bg-transparent border-none text-center">
                  <SelectValue placeholder="Select P1" />
                </SelectTrigger>
                <SelectContent>
                  {drivers
                    .filter((d) => d.id !== p2 && d.id !== p3)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: d.teamColor }}
                          />
                          {d.name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* P3 - Bronze */}
          <div className="flex flex-col items-center w-full max-w-[180px]">
            <span className="text-xs text-muted-foreground mb-2 f1-heading">
              P3
            </span>
            <div className="w-full h-32 glass rounded-lg flex items-center justify-center podium-bronze border-2 p-2">
              <Select value={p3} onValueChange={setP3} disabled={locked}>
                <SelectTrigger className="bg-transparent border-none text-center">
                  <SelectValue placeholder="Select P3" />
                </SelectTrigger>
                <SelectContent>
                  {drivers
                    .filter((d) => d.id !== p1 && d.id !== p2)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: d.teamColor }}
                          />
                          {d.name}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Scoring guide */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <span>P1: {25 * pointMultiplier}pts</span>
          <span>P2: {20 * pointMultiplier}pts</span>
          <span>P3: {15 * pointMultiplier}pts</span>
          <span>Exact podium: +{20 * pointMultiplier}pts</span>
        </div>
      </section>

      {/* Pole Position */}
      <section className="glass rounded-xl p-6 mb-6 animate-slide-up">
        <Label className="f1-heading text-sm text-muted-foreground mb-3 block">
          {isSprint ? "Sprint Pole" : "Pole Position"} · {10 * pointMultiplier}pts
        </Label>
        <Select value={pole} onValueChange={setPole} disabled={locked}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Select pole position" />
          </SelectTrigger>
          <SelectContent>
            {drivers.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: d.teamColor }}
                  />
                  #{d.number} {d.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Expect the Unexpected */}
      <section className="glass rounded-xl p-6 mb-8 animate-slide-up">
        <Label className="f1-heading text-sm text-muted-foreground mb-3 block">
          Expect the Unexpected · {15 * pointMultiplier}pts
        </Label>
        <Textarea
          placeholder="e.g., Albon will finish in top 5, Hamilton and Verstappen will both DNF"
          value={unexpected}
          onChange={(e) => setUnexpected(e.target.value.slice(0, 200))}
          disabled={locked}
          className="bg-background/50 resize-none h-24"
        />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {unexpected.length}/200
        </p>
      </section>

      {/* Validation hints */}
      {!locked && !canSubmit && (
        <div className="mb-4 text-xs text-muted-foreground space-y-1">
          {!p1 && <p className="text-f1-warning">• Select a driver for P1</p>}
          {!p2 && <p className="text-f1-warning">• Select a driver for P2</p>}
          {!p3 && <p className="text-f1-warning">• Select a driver for P3</p>}
          {!pole && <p className="text-f1-warning">• Select pole position</p>}
          {unexpected.length < 10 && (
            <p className="text-f1-warning">
              • Unexpected prediction needs at least 10 characters (
              {unexpected.length}/10)
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full"
        size="lg"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {locked
          ? "Predictions Locked"
          : loading
            ? "Submitting..."
            : `Submit ${isSprint ? "Sprint" : "Race"} Prediction`}
      </Button>
    </>
  );
};

export default PredictionForm;
