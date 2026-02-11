import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { getRaceById, isRaceLocked } from "@/lib/data/raceCalendar";
import { drivers } from "@/lib/data/drivers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Trophy, Lock } from "lucide-react";
import { toast } from "sonner";
import CountdownTimer from "@/components/dashboard/CountdownTimer";

const PREDICTIONS_KEY = "f1_predictions";

interface Prediction {
  raceId: string;
  userId: string;
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  unexpected: string;
}

const getSavedPrediction = (raceId: string, userId: string): Prediction | null => {
  try {
    const all: Prediction[] = JSON.parse(localStorage.getItem(PREDICTIONS_KEY) || "[]");
    return all.find((p) => p.raceId === raceId && p.userId === userId) || null;
  } catch {
    return null;
  }
};

const savePrediction = (prediction: Prediction) => {
  try {
    const all: Prediction[] = JSON.parse(localStorage.getItem(PREDICTIONS_KEY) || "[]");
    const idx = all.findIndex((p) => p.raceId === prediction.raceId && p.userId === prediction.userId);
    if (idx >= 0) all[idx] = prediction;
    else all.push(prediction);
    localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
};

const Predict = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [pole, setPole] = useState("");
  const [unexpected, setUnexpected] = useState("");

  const race = raceId ? getRaceById(raceId) : null;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (race && user) {
      const saved = getSavedPrediction(race.id, user.id);
      if (saved) {
        setP1(saved.p1);
        setP2(saved.p2);
        setP3(saved.p3);
        setPole(saved.pole);
        setUnexpected(saved.unexpected);
      }
    }
  }, [race, user]);

  if (!race) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container pt-24 text-center">
          <p className="text-muted-foreground">Race not found</p>
        </main>
      </div>
    );
  }

  const locked = isRaceLocked(race);
  const selected = [p1, p2, p3].filter(Boolean);

  const getAvailableDrivers = (currentSlot: string) => {
    return drivers.filter(
      (d) => d.id === currentSlot || !selected.includes(d.id) || d.id === currentSlot
    );
  };

  const canSubmit = p1 && p2 && p3 && pole && unexpected.length >= 10 && !locked;

  const handleSubmit = () => {
    if (!user) return;

    // Validate no duplicates
    const podium = [p1, p2, p3];
    if (new Set(podium).size !== 3) {
      toast.error("Each podium position must be a different driver");
      return;
    }

    if (unexpected.length < 10 || unexpected.length > 200) {
      toast.error("Unexpected prediction must be 10-200 characters");
      return;
    }

    savePrediction({
      raceId: race.id,
      userId: user.id,
      p1,
      p2,
      p3,
      pole,
      unexpected,
    });

    toast.success("Prediction submitted!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12 max-w-2xl">
        {/* Race header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{race.countryFlag}</span>
            <div>
              <h1 className="f1-heading text-2xl">{race.raceName}</h1>
              <p className="text-sm text-muted-foreground">{race.circuitName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            {race.sprintWeekend && (
              <Badge variant="outline" className="border-f1-warning/50 text-f1-warning text-xs gap-1">
                <Zap className="h-3 w-3" />
                Sprint · 0.5× Points
              </Badge>
            )}
            {locked ? (
              <Badge className="bg-primary/20 text-primary gap-1">
                <Lock className="h-3 w-3" />
                Predictions Locked
              </Badge>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Locks in <CountdownTimer targetDate={race.qualifyingStartTime} className="text-base" />
              </div>
            )}
          </div>
        </div>

        {/* Podium prediction */}
        <section className="glass rounded-xl p-6 mb-6 animate-slide-up">
          <h2 className="f1-heading text-sm text-muted-foreground mb-6 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-f1-gold" />
            Podium Prediction
          </h2>

          <div className="flex items-end justify-center gap-3 mb-6">
            {/* P2 - Silver */}
            <div className="flex flex-col items-center w-full max-w-[180px]">
              <span className="text-xs text-muted-foreground mb-2 f1-heading">P2</span>
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
              <span className="text-xs text-muted-foreground mb-2 f1-heading">P1</span>
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
              <span className="text-xs text-muted-foreground mb-2 f1-heading">P3</span>
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
            <span>P1: 25pts</span>
            <span>P2: 20pts</span>
            <span>P3: 15pts</span>
            <span>Exact podium: +20pts</span>
          </div>
        </section>

        {/* Pole Position */}
        <section className="glass rounded-xl p-6 mb-6 animate-slide-up">
          <Label className="f1-heading text-sm text-muted-foreground mb-3 block">
            Pole Position · 10pts
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
            Expect the Unexpected · 15pts
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

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full"
          size="lg"
        >
          {locked ? "Predictions Locked" : "Submit Prediction"}
        </Button>
      </main>
    </div>
  );
};

export default Predict;
