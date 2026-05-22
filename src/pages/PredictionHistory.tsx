import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, Edit3, FileClock, Loader2, Target, Trophy, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDrivers } from "@/hooks/useDrivers";
import { getUserPredictions } from "@/lib/api/predictions";
import { getAllRaces } from "@/lib/api/races";
import { cn } from "@/lib/utils";

export interface PredictionData {
  id: string;
  userId: string;
  raceWeekendId: string;
  type: "sprint" | "race";
  predictedP1: string;
  predictedP2: string;
  predictedP3: string;
  predictedPole: string;
  predictedConstructor?: string;
  unexpectedStatement: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface RaceLite {
  id: string;
  raceName: string;
  round: number;
  countryFlag: string;
  circuitName: string;
}

const PredictionHistory = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { drivers } = useDrivers();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [races, setRaces] = useState<RaceLite[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) setLoading(true);
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const [predictionData, raceData] = await Promise.all([getUserPredictions(), getAllRaces()]);
        setPredictions(predictionData);
        setSelectedKey(predictionData[0] ? `${predictionData[0].raceWeekendId}-${predictionData[0].type}` : "");
        setRaces(
          raceData.map((race) => ({
            id: race.raceId,
            raceName: race.raceName,
            round: race.round,
            countryFlag: race.countryFlag,
            circuitName: race.circuitName,
          })),
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load predictions");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [isAuthenticated, navigate, authLoading]);

  const getDriverName = (id?: string) => drivers.find((driver) => driver.id === id)?.name || id || "-";
  const getRace = (id: string) => races.find((race) => race.id === id);
  const racePicks = predictions.filter((item) => item.type === "race").length;
  const sprintPicks = predictions.filter((item) => item.type === "sprint").length;
  const selected = useMemo(
    () => predictions.find((item) => `${item.raceWeekendId}-${item.type}` === selectedKey) || predictions[0],
    [predictions, selectedKey],
  );
  const selectedRace = selected ? getRace(selected.raceWeekendId) : undefined;

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <section className="panel panel-corners overflow-hidden">
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="checker absolute right-0 top-0 h-72 w-72 opacity-[0.05]" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_420px] xl:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="label-eyebrow">Prediction notebook</span>
                  <span className="h-px w-16 bg-border" />
                  <Badge className="badge-signal">{predictions.length} saved</Badge>
                </div>
                <h1 className="display mt-7 max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-7xl">
                  Pick Journal
                </h1>
                <p className="data-mono mt-5 max-w-2xl text-sm uppercase leading-6 text-muted-foreground">
                  Select a submitted entry on the left, then inspect the full prediction sheet on the right.
                </p>
              </div>
              <div className="grid border border-border bg-surface-2/40 sm:grid-cols-3">
                {[
                  ["Entries", predictions.length],
                  ["Race", racePicks],
                  ["Sprint", sprintPicks],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-border p-4 sm:border-b-0 sm:border-r sm:last:border-r-0">
                    <p className="label-eyebrow">{label}</p>
                    <p className="data-mono mt-2 text-2xl font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-start">
          <Button variant="cockpit" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>

        {loading ? (
          <section className="section-card mt-8 flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-signal" />
          </section>
        ) : predictions.length === 0 ? (
          <section className="section-card mt-8 flex min-h-[320px] items-center justify-center text-center">
            <div>
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="display mt-4 text-2xl font-semibold text-white">No predictions yet</h3>
              <p className="data-mono mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Submitted predictions will appear here.</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-6" variant="signal">
                Go to dashboard
              </Button>
            </div>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 xl:grid-cols-[380px_1fr]">
            <aside className="panel panel-corners overflow-hidden">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="label-eyebrow">Entry rail</p>
                    <h2 className="display mt-1 text-lg font-semibold text-white">Submitted picks</h2>
                  </div>
                  <FileClock className="h-4 w-4 text-signal" />
                </div>
              </div>
              <div className="max-h-[720px] overflow-y-auto">
                {predictions.map((prediction, index) => {
                  const race = getRace(prediction.raceWeekendId);
                  const key = `${prediction.raceWeekendId}-${prediction.type}`;
                  const active = key === `${selected?.raceWeekendId}-${selected?.type}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedKey(key)}
                      className={cn(
                        "grid w-full grid-cols-[44px_1fr] gap-3 border-b border-border px-4 py-4 text-left transition-colors hover:bg-surface-2/45",
                        active && "bg-signal/10",
                      )}
                    >
                      <div className={cn("flex h-10 w-10 items-center justify-center border data-mono text-xs font-bold", active ? "border-signal bg-signal text-signal-foreground" : "border-border bg-surface-2 text-muted-foreground")}>
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={prediction.type === "sprint" ? "border-warning/30 bg-warning/10 text-warning" : "border-signal/30 bg-signal/10 text-signal"}>
                            {prediction.type}
                          </Badge>
                          <span className="data-mono text-[10px] text-muted-foreground">
                            {new Date(prediction.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="display mt-2 truncate text-lg font-semibold text-white">
                          {race?.countryFlag} {race?.raceName || prediction.raceWeekendId}
                        </p>
                        <p className="data-mono mt-1 truncate text-[10px] uppercase text-muted-foreground">
                          {race ? `R${race.round} / ${race.circuitName}` : prediction.raceWeekendId}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {selected && (
              <article className="panel panel-corners overflow-hidden">
                <div>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className={selected.type === "sprint" ? "border-warning/30 bg-warning/10 text-warning" : "border-signal/30 bg-signal/10 text-signal"}>
                        {selected.type === "sprint" ? <Zap className="mr-1 h-3 w-3" /> : <Target className="mr-1 h-3 w-3" />}
                        {selected.type}
                      </Badge>
                      <span className="data-mono flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {new Date(selected.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h2 className="display mt-5 text-4xl font-bold text-white sm:text-5xl">
                      {selectedRace?.countryFlag} {selectedRace?.raceName || selected.raceWeekendId}
                    </h2>
                    <p className="data-mono mt-3 text-xs uppercase text-muted-foreground">
                      {selectedRace ? `R${selectedRace.round} / ${selectedRace.circuitName}` : selected.raceWeekendId}
                    </p>

                    <div className="mt-8 grid gap-3 md:grid-cols-3">
                      {[
                        ["P1", selected.predictedP1, "border-signal/40 bg-signal/10"],
                        ["P2", selected.predictedP2, "border-f1-silver/30 bg-white/5"],
                        ["P3", selected.predictedP3, "border-f1-bronze/30 bg-f1-bronze/10"],
                      ].map(([label, driver, classes]) => (
                        <div key={label} className={cn("min-h-32 border p-4", classes)}>
                          <p className="data-mono text-xs font-bold text-muted-foreground">{label}</p>
                          <p className="display mt-5 truncate text-2xl font-bold text-white">{getDriverName(driver)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="border border-border bg-surface-2/50 p-4">
                        <p className="label-eyebrow">Pole position</p>
                        <p className="display mt-3 text-xl font-semibold text-white">{getDriverName(selected.predictedPole)}</p>
                      </div>
                      <div className="border border-border bg-surface-2/50 p-4">
                        <p className="label-eyebrow">Constructor</p>
                        <p className="display mt-3 text-xl font-semibold text-white">{selected.predictedConstructor || "None"}</p>
                      </div>
                    </div>

                    {selected.unexpectedStatement && (
                      <div className="mt-4 border border-warning/20 bg-warning/10 p-4">
                        <p className="label-eyebrow text-warning">Unexpected statement</p>
                        <p className="mt-3 text-sm leading-6 text-white/78">{selected.unexpectedStatement}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="data-mono text-[10px] uppercase text-muted-foreground">
                        Last update / {new Date(selected.updatedAt).toLocaleString()}
                      </p>
                      <Button
                        variant="signal"
                        onClick={() => navigate(`/predict/${selected.raceWeekendId}/${selected.type}`)}
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit this pick
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </section>
        )}
      </main>
    </PageShell>
  );
};

export default PredictionHistory;
