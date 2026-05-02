import { useEffect, useState } from "react";
import { AlertCircle, Loader, ShieldCheck } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useDrivers } from "@/hooks/useDrivers";
import { apiClient } from "@/lib/api/client";
import { getAllRaces } from "@/lib/api/races";
import { type RaceWeekend } from "@/lib/data/raceCalendar";

interface RaceResult {
  id: string;
  raceId: string;
  type: "sprint" | "race";
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  fastestLap: string;
  dnfCount: number;
  safetyCars: number;
  redFlags: number;
  bestConstructor?: string;
  isOfficial: boolean;
}

const Results = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { drivers } = useDrivers();
  const [races, setRaces] = useState<RaceWeekend[]>([]);

  const getDriverName = (id?: string) => {
    if (!id) return "TBC";
    const driver = drivers.find((d) => d.id === id);
    return driver ? driver.name : id;
  };

  const now = new Date();
  const completedRaces = races
    .filter((r) => !r.cancelled && new Date(r.raceStartTime) < now)
    .sort((a, b) => a.round - b.round);

  const [selectedRaceId, setSelectedRaceId] = useState<string>("");

  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        timeZone: race.timeZone,
        isLocked: race.isLocked || false,
        isComplete: race.isComplete || false,
        cancelled: race.cancelled || false,
      }));
      setRaces(converted);

      const completed = converted
        .filter((r) => !r.cancelled && new Date(r.raceStartTime) < new Date())
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

  const selectedRace = races.find((r) => r.id === selectedRaceId);
  const selectedRaceName = selectedRace?.raceName;

  return (
    <PageShell>
      <Navbar />
      <main className="container pb-12 pt-24 md:pt-32">
        <PageHeader
          eyebrow="Official data"
          title="Race results archive"
          description="Browse completed weekends with a cleaner split between the event selector and the published official results."
          badge="Verified"
          stats={[
            { label: "Completed races", value: `${completedRaces.length}` },
            { label: "Selected event", value: selectedRaceName || "None" },
            { label: "Official cards", value: `${results.length}` },
            { label: "Season", value: "2026" },
          ]}
        />

        {authIsLoading ? (
          <section className="section-card mt-8 flex min-h-[360px] flex-col items-center justify-center">
            <Loader className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Authenticating...</p>
          </section>
        ) : completedRaces.length === 0 ? (
          <section className="section-card mt-8 text-center">
            <p className="font-heading text-2xl text-white">No completed races yet</p>
            <p className="mt-3 text-sm text-white/60">Results will appear here once the season gets underway.</p>
          </section>
        ) : (
          <section className="mt-8 grid gap-4 xl:grid-cols-[300px_1fr]">
            <aside className="section-card h-fit">
              <p className="page-eyebrow">Race picker</p>
              <h2 className="mt-2 font-heading text-2xl text-white">Completed weekends</h2>
              <div className="mt-6 space-y-2">
                {completedRaces.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => setSelectedRaceId(race.id)}
                    className={`w-full rounded-[1.25rem] border px-4 py-4 text-left transition-all ${
                      selectedRaceId === race.id
                        ? "border-primary/25 bg-primary/10 shadow-[0_18px_45px_rgba(255,107,62,0.18)]"
                        : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                        {race.countryFlag}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-heading text-base text-white">{race.raceName}</p>
                        <p className="text-sm text-white/45">Round {race.round}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <div className="space-y-4">
              {isLoading ? (
                <div className="section-card flex min-h-[360px] flex-col items-center justify-center">
                  <Loader className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading official results...</p>
                </div>
              ) : selectedRace?.cancelled ? (
                <div className="section-card border border-destructive/20 bg-destructive/10 text-center">
                  <p className="font-heading text-2xl text-destructive">This race was cancelled.</p>
                </div>
              ) : error ? (
                <div className="section-card border border-destructive/20 bg-destructive/10">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
                    <div>
                      <h3 className="font-heading text-xl text-destructive">Failed to load results</h3>
                      <p className="mt-2 text-sm text-white/65">{error}</p>
                    </div>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="section-card flex min-h-[320px] items-center justify-center text-center">
                  <p className="text-white/60">No official results have been published for {selectedRaceName} yet.</p>
                </div>
              ) : (
                results.map((result) => (
                  <article key={result.id} className="section-card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div>
                        <p className="page-eyebrow">{result.type === "sprint" ? "Sprint session" : "Grand Prix"}</p>
                        <h2 className="mt-2 font-heading text-2xl text-white">{selectedRaceName}</h2>
                      </div>
                      {result.isOfficial && (
                        <Badge className="rounded-full border border-emerald-400/20 bg-emerald-400/12 px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300">
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                          Official
                        </Badge>
                      )}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="panel-subtle">
                        <p className="page-eyebrow">Podium</p>
                        <div className="mt-4 grid gap-3">
                          <div className="flex items-center gap-3 rounded-2xl border border-f1-gold/20 bg-f1-gold/10 px-4 py-3">
                            <span className="text-2xl">🥇</span>
                            <span className="font-semibold text-f1-gold">{getDriverName(result.p1)}</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                            <span className="text-2xl">🥈</span>
                            <span className="font-semibold text-white/88">{getDriverName(result.p2)}</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl border border-f1-bronze/20 bg-f1-bronze/10 px-4 py-3">
                            <span className="text-2xl">🥉</span>
                            <span className="font-semibold text-f1-bronze">{getDriverName(result.p3)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="panel-subtle">
                          <p className="page-eyebrow">Pole</p>
                          <p className="mt-3 font-heading text-xl text-white">{getDriverName(result.pole)}</p>
                        </div>
                        <div className="panel-subtle">
                          <p className="page-eyebrow">Best constructor</p>
                          <p className="mt-3 font-heading text-xl text-white">{result.bestConstructor || "TBC"}</p>
                        </div>
                        <div className="panel-subtle">
                          <p className="page-eyebrow">Race notes</p>
                          <div className="mt-3 grid gap-2 text-sm text-white/65">
                            <p className="flex items-center justify-between"><span>Safety cars</span><span>{result.safetyCars}</span></p>
                            <p className="flex items-center justify-between"><span>Red flags</span><span>{result.redFlags}</span></p>
                            <p className="flex items-center justify-between"><span>DNFs</span><span>{result.dnfCount}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </PageShell>
  );
};

export default Results;
