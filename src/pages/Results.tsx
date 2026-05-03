import { useEffect, useState } from "react";
import { AlertCircle, Flag, Loader, ShieldCheck, Trophy, Zap, TrendingUp, Users } from "lucide-react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { LiveLeaderboard, FastestLaps, PaceComparison, TelemetryPanel, StandingsPanel } from "@/components/analysis";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenF1Session } from "@/contexts/OpenF1SessionContext";
import { useDrivers } from "@/hooks/useDrivers";
import { apiClient } from "@/lib/api/client";
import { getAllRaces } from "@/lib/api/races";
import { getDriverStandings, getConstructorStandings } from "@/lib/api/championship";
import { getOpenF1Sessions } from "@/lib/api/openf1";
import { getRaceSession } from "@/services/raceAnalysisService.js";
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

interface DriverStanding {
  position: number;
  driverId: string;
  driverName: string;
  teamColor: string;
  countryFlag: string;
  points: number;
  wins: number;
  podiums: number;
}

interface ConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
}

interface OpenF1Session {
  session_key: number;
  session_name: string;
  date_start: string;
}

const Results = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { drivers } = useDrivers();
  const { setSessionKey } = useOpenF1Session();
  const [races, setRaces] = useState<RaceWeekend[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriverNumber, setSelectedDriverNumber] = useState<number | null>(null);
  
  // Live OpenF1 session state
  const [liveSessionKey, setLiveSessionKey] = useState<number | null>(null);
  const [loadingSessionKey, setLoadingSessionKey] = useState(false);
  
  // Championship standings
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);

  const getDriverName = (id?: string) => {
    if (!id) return "TBC";
    const driver = drivers.find((d) => d.id === id);
    return driver ? driver.name : id;
  };

  const getDriverNumber = (id?: string) => {
    if (!id) return null;
    const driver = drivers.find((d) => d.id === id);
    return driver ? parseInt(driver.carNumber || "0") : null;
  };

  const now = new Date();
  const completedRaces = races
    .filter((race) => !race.cancelled && new Date(race.raceStartTime) < now)
    .sort((a, b) => a.round - b.round);

  // ============================================
  // EFFECT 1: Fetch championship standings
  // ============================================
  useEffect(() => {
    const fetchStandings = async () => {
      setStandingsLoading(true);
      try {
        const [drivers, constructors] = await Promise.all([
          getDriverStandings(),
          getConstructorStandings(),
        ]);
        setDriverStandings(drivers);
        setConstructorStandings(constructors);
      } catch (err) {
        console.error("[Results] Failed to fetch standings:", err);
      } finally {
        setStandingsLoading(false);
      }
    };

    fetchStandings();
  }, []);

  // ============================================
  // EFFECT 2: Fetch races from database
  // ============================================
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

  // ============================================
  // EFFECT 3: Fetch race results from database
  // ============================================
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

  // ============================================
  // EFFECT 4: Fetch OpenF1 race session (ONCE)
  // Fetches the "Race" session for live data
  // ============================================
  useEffect(() => {
    if (!selectedRaceId || !isAuthenticated) return;

    const fetchOpenF1Session = async () => {
      try {
        setLoadingSessionKey(true);
        const selectedRace = races.find((r) => r.id === selectedRaceId);
        if (!selectedRace) return;

        // Get the year and country from the selected race
        const raceDate = new Date(selectedRace.raceStartTime);
        const year = raceDate.getFullYear();
        const country = selectedRace.country;

        // Fetch all sessions for this race
        const sessions = await getOpenF1Sessions(year, country);
        
        // Filter for the "Race" session only
        const raceSession = getRaceSession(sessions);
        
        if (raceSession) {
          setLiveSessionKey((raceSession as OpenF1Session).session_key);
          setSessionKey((raceSession as OpenF1Session).session_key);
          console.log(`[Results] Found race session key: ${(raceSession as OpenF1Session).session_key}`);
        } else {
          console.warn("[Results] No race session found for this event");
          setLiveSessionKey(null);
        }
      } catch (err) {
        console.error("[Results] Error fetching OpenF1 session:", err);
        setLiveSessionKey(null);
      } finally {
        setLoadingSessionKey(false);
      }
    };

    fetchOpenF1Session();
  }, [selectedRaceId, isAuthenticated, races, setSessionKey]);

  const selectedRace = races.find((race) => race.id === selectedRaceId);
  const primaryResult = results.find((result) => result.type === "race") || results[0];

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-[1920px] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        {/* ============================================
            PAGE HEADER
            ============================================ */}
        <section className="panel panel-corners overflow-hidden mb-8">
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="checker absolute right-0 top-0 h-72 w-72 opacity-[0.05]" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_360px] xl:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="label-eyebrow">ðŸ Race Analysis</span>
                  <span className="h-px w-16 bg-border" />
                  <Badge className="badge-signal">{completedRaces.length} completed</Badge>
                </div>
                <h1 className="display mt-7 max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-7xl">
                  Real-time Intelligence
                </h1>
                <p className="data-mono mt-5 max-w-2xl text-sm uppercase leading-6 text-muted-foreground">
                  Live positions, pace analysis, and comprehensive race telemetry.
                </p>
              </div>
              <div className="border border-border bg-surface-2/40 p-5">
                <p className="label-eyebrow">ðŸ“ Selected event</p>
                <p className="display mt-3 truncate text-3xl font-bold text-white">
                  {selectedRace ? `${selectedRace.countryFlag} ${selectedRace.raceName}` : "None"}
                </p>
                <p className="data-mono mt-2 truncate text-xs uppercase text-muted-foreground">
                  {selectedRace ? `R${selectedRace.round} / ${selectedRace.circuitName}` : "No race selected"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {authIsLoading || loadingSessionKey ? (
          <section className="section-card flex min-h-[360px] flex-col items-center justify-center">
            <Loader className="mb-4 h-8 w-8 animate-spin text-signal" />
            <p className="data-mono text-muted-foreground">
              {authIsLoading ? "Checking session..." : "Loading race data..."}
            </p>
          </section>
        ) : completedRaces.length === 0 ? (
          <section className="section-card text-center">
            <p className="display text-2xl font-semibold text-white">No completed races yet</p>
            <p className="data-mono mt-3 text-sm text-white/60">
              Results and live data will appear after races are completed.
            </p>
          </section>
        ) : (
          <>
            {/* ============================================
                RACE SELECTOR
                ============================================ */}
            <section className="overflow-x-auto border border-border bg-surface-1 mb-8">
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
                    <p className="data-mono text-xs text-muted-foreground">ROUND {race.round}</p>
                    <p className="mt-2 text-3xl">{race.countryFlag}</p>
                    <p className="display mt-2 truncate text-lg font-semibold text-white">
                      {race.raceName}
                    </p>
                    <p className="data-mono mt-1 text-xs text-white/50">{race.circuitName}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* ============================================
                ROW 1: LIVE LEADERBOARD + FASTEST LAPS
                ============================================ */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <LiveLeaderboard
                sessionKey={liveSessionKey}
                onDriverSelect={setSelectedDriverNumber}
              />
              <FastestLaps
                sessionKey={liveSessionKey}
                onDriverSelect={setSelectedDriverNumber}
              />
            </div>

            {/* ============================================
                ROW 2: PACE COMPARISON (FULL WIDTH)
                ============================================ */}
            <div className="mb-8">
              <PaceComparison
                sessionKey={liveSessionKey}
                onDriverSelect={setSelectedDriverNumber}
              />
            </div>

            {/* ============================================
                ROW 3: TELEMETRY PANEL (FULL WIDTH)
                ============================================ */}
            <div className="mb-8">
              <TelemetryPanel
                sessionKey={liveSessionKey}
                selectedDriverNumber={selectedDriverNumber}
              />
            </div>

            {/* ============================================
                ROW 4: STANDINGS + RACE RESULTS
                ============================================ */}
            <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {/* Race Results (Main) */}
              <div className="lg:col-span-2 xl:col-span-3">
                <CockpitPanel
                  code="CLS.01"
                  title="Official Classification"
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
                      <p className="display text-2xl font-semibold text-destructive">
                        This race was cancelled.
                      </p>
                    </div>
                  ) : error ? (
                    <div className="m-5 border border-destructive/20 bg-destructive/10 p-5">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
                        <div>
                          <h3 className="display text-xl font-semibold text-destructive">
                            Failed to load results
                          </h3>
                          <p className="data-mono mt-2 text-sm text-white/65">{error}</p>
                        </div>
                      </div>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="flex min-h-[320px] items-center justify-center p-8 text-center">
                      <p className="data-mono text-white/60">
                        No results have been published for {selectedRace?.raceName}.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {results.map((result) => (
                        <article key={result.id} className="p-5">
                          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <Badge
                              variant="outline"
                              className={
                                result.type === "sprint"
                                  ? "border-warning/30 bg-warning/10 text-warning"
                                  : "border-signal/30 bg-signal/10 text-signal"
                              }
                            >
                              {result.type === "sprint" ? (
                                <Zap className="mr-1 h-3 w-3" />
                              ) : (
                                <Flag className="mr-1 h-3 w-3" />
                              )}
                              {result.type.toUpperCase()}
                            </Badge>
                          </div>

                          {/* Podium */}
                          <div className="mb-6 grid gap-3 md:grid-cols-3">
                            {[
                              ["P1", result.p1, "border-signal/50 bg-signal/10 text-signal", "ðŸ¥‡"],
                              ["P2", result.p2, "border-f1-silver/40 bg-white/5 text-white", "ðŸ¥ˆ"],
                              ["P3", result.p3, "border-f1-bronze/40 bg-f1-bronze/10 text-f1-bronze", "ðŸ¥‰"],
                            ].map(([label, driver, classes, emoji]) => (
                              <div
                                key={label}
                                className={cn(
                                  "border p-5 cursor-pointer transition-all hover:bg-surface-2/30 rounded",
                                  classes,
                                )}
                                onClick={() => {
                                  const num = getDriverNumber(driver);
                                  if (num) setSelectedDriverNumber(num);
                                }}
                              >
                                <p className="data-mono text-xs font-bold">
                                  {emoji} {label}
                                </p>
                                <p className="display mt-4 truncate text-2xl font-bold text-white">
                                  {getDriverName(driver)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Race Details */}
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="border border-border bg-surface-2/50 p-4 rounded">
                              <p className="label-eyebrow">ðŸŽ¯ Pole position</p>
                              <p className="display mt-3 text-xl font-semibold text-white">
                                {getDriverName(result.pole)}
                              </p>
                            </div>
                            <div className="border border-border bg-surface-2/50 p-4 rounded">
                              <p className="label-eyebrow">ðŸ¢ Best constructor</p>
                              <p className="display mt-3 text-xl font-semibold text-white">
                                {result.bestConstructor || "TBC"}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </CockpitPanel>
              </div>

              {/* Sidebar: Standings + Stats */}
              <aside className="space-y-6">
                {/* Championship Standings */}
                <StandingsPanel
                  driverStandings={driverStandings}
                  constructorStandings={constructorStandings}
                  loading={standingsLoading}
                />

                {/* Race Statistics */}
                {primaryResult && (
                  <CockpitPanel code="STATS" title="Race Stats" bodyClassName="p-4" corners>
                    <div className="grid gap-3">
                      {[
                        ["âš ï¸ Safety cars", primaryResult.safetyCars ?? 0],
                        ["ðŸš© Red flags", primaryResult.redFlags ?? 0],
                        ["ðŸ’” DNFs", primaryResult.dnfCount ?? 0],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between border border-border bg-surface-2/50 px-4 py-3 rounded"
                        >
                          <span className="label-eyebrow text-xs">{label}</span>
                          <span className="data-mono text-xl font-bold text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CockpitPanel>
                )}

                {/* Winner Signal */}
                {primaryResult && (
                  <CockpitPanel code="POD" title="Victory Signal" bodyClassName="p-5" corners>
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center border border-signal bg-signal/10 text-signal text-2xl rounded">
                        ðŸ†
                      </div>
                      <div className="min-w-0">
                        <p className="label-eyebrow">Champion</p>
                        <p className="display mt-2 truncate text-2xl font-bold text-white">
                          {getDriverName(primaryResult.p1)}
                        </p>
                      </div>
                    </div>
                  </CockpitPanel>
                )}

                {/* Circuit Info */}
                {selectedRace && (
                  <CockpitPanel code="CIRC" title="Circuit Info" bodyClassName="p-4" corners>
                    <div className="space-y-3">
                      <div className="border border-border bg-surface-2/50 p-3 rounded">
                        <p className="data-mono text-xs text-muted-foreground">Circuit</p>
                        <p className="display mt-2 font-semibold text-white">{selectedRace.circuitName}</p>
                      </div>
                      <div className="border border-border bg-surface-2/50 p-3 rounded">
                        <p className="data-mono text-xs text-muted-foreground">Country</p>
                        <p className="display mt-2 font-semibold text-white">{selectedRace.country}</p>
                      </div>
                      <div className="border border-border bg-surface-2/50 p-3 rounded">
                        <p className="data-mono text-xs text-muted-foreground">Timezone</p>
                        <p className="data-mono mt-2 text-sm font-semibold text-white">
                          {selectedRace.timeZone}
                        </p>
                      </div>
                    </div>
                  </CockpitPanel>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </PageShell>
  );
};

export default Results;