import { useEffect, useState } from "react";
import { AlertCircle, Flag, Loader, ShieldCheck, Trophy, Zap } from "lucide-react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useDrivers } from "@/hooks/useDrivers";
import { apiClient } from "@/lib/api/client";
import { getAllRaces } from "@/lib/api/races";
import { type RaceWeekend } from "@/lib/data/raceCalendar";
import { cn } from "@/lib/utils";

interface RaceResult {
  id: string;
  raceId: string;
  type: "sprint" | "race";
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  fastestLap?: string;
  dnfCount?: number;
  safetyCars?: number;
  redFlags?: number;
  bestConstructor?: string;
  isOfficial: boolean;
}

const Results = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { drivers } = useDrivers();
  const [races, setRaces] = useState<RaceWeekend[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDriverName = (id?: string) => {
    if (!id) return "TBC";
    const driver = drivers.find((d) => d.id === id);
    return driver ? driver.name : id;
  };

  const now = new Date();
  const completedRaces = races
    .filter((race) => !race.cancelled && new Date(race.raceStartTime) < now)
    .sort((a, b) => a.round - b.round);

  useEffect(() => {
    const fetchRaces = async () => {
      const serverRaces = await getAllRaces();
      const converted = serverRaces.map((race) => ({
        id: race.raceId,
        raceName: race.raceName,
        circuitName: race.circuitName,
        country: race.country || "",
        countryFlag: race.countryFlag,
        round: race.round,
        qualifyingStartTime: race.qualifyingStartTime,
        raceStartTime: race.raceStartTime,
        sprintWeekend: race.sprintWeekend,
        sprintQualifyingStartTime: race.sprintQualifyingStartTime,
        sprintStartTime: race.sprintStartTime,
        timeZone: race.timeZone,
        isLocked: race.isLocked || false,
        isComplete: race.isComplete || false,
        cancelled: race.cancelled || false,
      }));
      setRaces(converted);

      const completed = converted
        .filter((race) => !race.cancelled && new Date(race.raceStartTime) < new Date())
        .sort((a, b) => a.round - b.round);
      if (!selectedRaceId && completed.length > 0) {
        setSelectedRaceId(completed[completed.length - 1].id);
      }
    };

    fetchRaces();
  }, [selectedRaceId]);

  useEffect(() => {
    if (authIsLoading) return;
    if (!selectedRaceId || !isAuthenticated) return;

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiClient.get<any>(`/api/leaderboard/results/${selectedRaceId}`);
        if (res.success && res.data) {
          setResults(res.data);
        } else {
          setError(res.error || "Failed to load results");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [selectedRaceId, isAuthenticated, authIsLoading]);

  const selectedRace = races.find((race) => race.id === selectedRaceId);
  const primaryResult = results.find((result) => result.type === "race") || results[0];

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <section className="panel panel-corners overflow-hidden">
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="checker absolute right-0 top-0 h-72 w-72 opacity-[0.05]" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_420px] xl:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="label-eyebrow">Classification board</span>
                  <span className="h-px w-16 bg-border" />
                  <Badge className="badge-signal">{completedRaces.length} completed</Badge>
                </div>
                <h1 className="display mt-7 max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-7xl">
                  Results Control
                </h1>
                <p className="data-mono mt-5 max-w-2xl text-sm uppercase leading-6 text-muted-foreground">
                  Pick a completed round and inspect the official podium, pole, constructor, and race notes.
                </p>
              </div>
              <div className="border border-border bg-surface-2/40 p-5">
                <p className="label-eyebrow">Selected event</p>
                <p className="display mt-3 truncate text-3xl font-bold text-white">
                  {selectedRace ? `${selectedRace.countryFlag} ${selectedRace.raceName}` : "None"}
                </p>
                <p className="data-mono mt-2 truncate text-xs uppercase text-muted-foreground">
                  {selectedRace ? `R${selectedRace.round} / ${selectedRace.circuitName}` : "No completed race selected"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {authIsLoading ? (
          <section className="section-card mt-8 flex min-h-[360px] flex-col items-center justify-center">
            <Loader className="mb-4 h-8 w-8 animate-spin text-signal" />
            <p className="data-mono text-muted-foreground">Checking session...</p>
          </section>
        ) : completedRaces.length === 0 ? (
          <section className="section-card mt-8 text-center">
            <p className="display text-2xl font-semibold text-white">No completed races yet</p>
            <p className="data-mono mt-3 text-sm text-white/60">Results will appear after completed races.</p>
          </section>
        ) : (
          <>
            <section className="mt-8 overflow-x-auto border border-border bg-surface-1">
              <div className="flex min-w-max divide-x divide-border">
                {completedRaces.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => setSelectedRaceId(race.id)}
                    className={cn(
                      "w-64 px-4 py-4 text-left transition-colors hover:bg-surface-2/60",
                      selectedRaceId === race.id && "bg-signal/10",
                    )}
                  >
                    <p className="data-mono text-xs text-muted-foreground">R{race.round}</p>
                    <p className="mt-2 text-3xl">{race.countryFlag}</p>
                    <p className="display mt-2 truncate text-lg font-semibold text-white">{race.raceName}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
              <CockpitPanel
                code="CLS.01"
                title="Official classification"
                action={
                  primaryResult?.isOfficial && (
                    <Badge className="border-signal/30 bg-signal/10 text-signal">
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                      Official
                    </Badge>
                  )
                }
                corners
              >
                {isLoading ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center">
                    <Loader className="mb-4 h-8 w-8 animate-spin text-signal" />
                    <p className="data-mono text-muted-foreground">Loading results...</p>
                  </div>
                ) : selectedRace?.cancelled ? (
                  <div className="m-5 border border-destructive/20 bg-destructive/10 p-6 text-center">
                    <p className="display text-2xl font-semibold text-destructive">This race was cancelled.</p>
                  </div>
                ) : error ? (
                  <div className="m-5 border border-destructive/20 bg-destructive/10 p-5">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
                      <div>
                        <h3 className="display text-xl font-semibold text-destructive">Failed to load results</h3>
                        <p className="data-mono mt-2 text-sm text-white/65">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex min-h-[320px] items-center justify-center p-8 text-center">
                    <p className="data-mono text-white/60">No results have been published for {selectedRace?.raceName}.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {results.map((result) => (
                      <article key={result.id} className="p-5">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <Badge variant="outline" className={result.type === "sprint" ? "border-warning/30 bg-warning/10 text-warning" : "border-signal/30 bg-signal/10 text-signal"}>
                              {result.type === "sprint" ? <Zap className="mr-1 h-3 w-3" /> : <Flag className="mr-1 h-3 w-3" />}
                              {result.type}
                            </Badge>
                            <h2 className="display mt-3 text-2xl font-bold text-white">{selectedRace?.raceName}</h2>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          {[
                            ["P1", result.p1, "border-signal/50 bg-signal/10 text-signal"],
                            ["P2", result.p2, "border-f1-silver/40 bg-white/5 text-white"],
                            ["P3", result.p3, "border-f1-bronze/40 bg-f1-bronze/10 text-f1-bronze"],
                          ].map(([label, driver, classes]) => (
                            <div key={label} className={cn("border p-4", classes)}>
                              <p className="data-mono text-xs font-bold">{label}</p>
                              <p className="display mt-4 truncate text-2xl font-bold text-white">{getDriverName(driver)}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="border border-border bg-surface-2/50 p-4">
                            <p className="label-eyebrow">Pole position</p>
                            <p className="display mt-3 text-xl font-semibold text-white">{getDriverName(result.pole)}</p>
                          </div>
                          <div className="border border-border bg-surface-2/50 p-4">
                            <p className="label-eyebrow">Best constructor</p>
                            <p className="display mt-3 text-xl font-semibold text-white">{result.bestConstructor || "TBC"}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </CockpitPanel>

              <aside className="space-y-6">
                <CockpitPanel code="NOTES" title="Race notes" bodyClassName="p-4" corners>
                  <div className="grid gap-3">
                    {[
                      ["Safety cars", primaryResult?.safetyCars ?? 0],
                      ["Red flags", primaryResult?.redFlags ?? 0],
                      ["DNFs", primaryResult?.dnfCount ?? 0],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between border border-border bg-surface-2/50 px-4 py-3">
                        <span className="label-eyebrow">{label}</span>
                        <span className="data-mono text-xl font-bold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </CockpitPanel>

                <CockpitPanel code="POD" title="Winner signal" bodyClassName="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center border border-signal bg-signal/10 text-signal">
                      <Trophy className="h-8 w-8" />
                    </div>
                    <div className="min-w-0">
                      <p className="label-eyebrow">Classified P1</p>
                      <p className="display mt-2 truncate text-2xl font-bold text-white">{getDriverName(primaryResult?.p1)}</p>
                    </div>
                  </div>
                </CockpitPanel>
              </aside>
            </section>
          </>
        )}
      </main>
    </PageShell>
  );
};

export default Results;
