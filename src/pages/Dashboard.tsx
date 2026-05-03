import { useEffect, useState } from "react";
import { CalendarClock, ChevronRight, Clock3, Cpu, Flag, Gauge, Lock, Target, Timer, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import CountdownTimer from "@/components/dashboard/CountdownTimer";
import FastestLap from "@/components/FastestLap";
import { CockpitPanel } from "@/components/layout/CockpitPanel";
import LiveLeaderboard from "@/components/LiveLeaderboard";
import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import TelemetryChart from "@/components/TelemetryChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenF1Session } from "@/contexts/OpenF1SessionContext";
import { getUpcomingRacesFromServer } from "@/lib/api/races";
import { getPredictionLockTime, isRaceLocked, isSprintLocked, type RaceWeekend } from "@/lib/data/raceCalendar";
import { cn } from "@/lib/utils";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (date: string, timeZone: string) =>
  new Date(date).toLocaleTimeString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });

const getSprintStartTime = (race: RaceWeekend) => {
  if (!race.sprintWeekend) return null;
  if (race.sprintStartTime) return race.sprintStartTime;
  return new Date(new Date(race.qualifyingStartTime).getTime() - 4 * 60 * 60 * 1000).toISOString();
};

const Dashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { sessionKey, setSessionKey } = useOpenF1Session();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<RaceWeekend[]>([]);
  const [racesLoading, setRacesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    loadRaces();
  }, []);

  const nextRace = upcoming[0];
  const liveSessionKey =
    nextRace?.openF1RaceSessionKey ||
    nextRace?.openF1QualifyingSessionKey ||
    nextRace?.openF1SprintQualifyingSessionKey ||
    null;

  useEffect(() => {
    setSessionKey(liveSessionKey);
  }, [liveSessionKey, setSessionKey]);

  const loadRaces = async () => {
    setRacesLoading(true);
    setError(null);
    try {
      const serverRaces = await getUpcomingRacesFromServer();
      const converted: RaceWeekend[] = serverRaces.map((race) => ({
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
        openF1QualifyingSessionKey: race.openF1QualifyingSessionKey,
        openF1RaceSessionKey: race.openF1RaceSessionKey,
        openF1SprintQualifyingSessionKey: race.openF1SprintQualifyingSessionKey,
        timeZone: race.timeZone,
        isLocked: race.isLocked || false,
        isComplete: race.isComplete || false,
        cancelled: race.cancelled || false,
        officialResults: null,
      }));
      setUpcoming(converted);
    } catch {
      setError("Failed to load races from server");
      setUpcoming([]);
    } finally {
      setRacesLoading(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-signal" />
      </div>
    );
  }

  const sprintCount = upcoming.filter((race) => race.sprintWeekend).length;
  const openRaceWindows = upcoming.filter((race) => !race.cancelled && !race.isComplete && !isRaceLocked(race)).length;
  const openSprintWindows = upcoming.filter((race) => race.sprintWeekend && !isSprintLocked(race)).length;
  const nextRaceLocked = nextRace ? isRaceLocked(nextRace) : false;
  const nextRaceLockTime = nextRace ? getPredictionLockTime(nextRace, "race") : null;
  const countdownTarget = nextRaceLocked || !nextRaceLockTime ? nextRace?.raceStartTime : nextRaceLockTime.toISOString();
  const countdownLabel = nextRaceLocked ? "Race starts in" : "GP prediction lock";
  const nextRaceSessions = nextRace
    ? [
        ...(nextRace.sprintWeekend && nextRace.sprintQualifyingStartTime
          ? [["Sprint Quali", nextRace.sprintQualifyingStartTime, Timer] as const]
          : []),
        ...(nextRace.sprintWeekend && getSprintStartTime(nextRace)
          ? [["Sprint", getSprintStartTime(nextRace) as string, Zap] as const]
          : []),
        ["Qualifying", nextRace.qualifyingStartTime, Clock3] as const,
        ["Race", nextRace.raceStartTime, Flag] as const,
      ]
    : [];

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        {error ? (
          <section className="section-card border border-destructive/20 bg-destructive/10">
            <p className="display text-xl font-semibold text-destructive">Unable to load calendar</p>
            <p className="data-mono mt-3 text-sm text-white/65">{error}</p>
          </section>
        ) : racesLoading ? (
          <section className="section-card flex min-h-[320px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-signal" />
              <p className="data-mono text-sm text-white/60">Loading race schedule...</p>
            </div>
          </section>
        ) : nextRace ? (
          <>
            <section className="panel panel-corners overflow-hidden">
              <div className="grid lg:grid-cols-[1fr_360px]">
                <div className="relative min-h-[360px] overflow-hidden p-5 sm:p-7 lg:p-8">
                  <div className="checker absolute right-0 top-0 h-72 w-72 opacity-[0.05]" />
                  <div className="relative flex h-full flex-col justify-between gap-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="label-eyebrow">Race control dashboard</span>
                        <span className="h-px w-16 bg-border" />
                        <Badge className="badge-signal">R{nextRace.round} active</Badge>
                      </div>

                      <div className="mt-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-5">
                            <span className="text-7xl leading-none sm:text-8xl">{nextRace.countryFlag}</span>
                            <div className="min-w-0">
                              <p className="data-mono text-sm uppercase text-signal">Up next</p>
                              <h1 className="display mt-1 max-w-4xl text-4xl font-bold leading-[0.95] text-white sm:text-6xl xl:text-7xl">
                                {nextRace.raceName}
                              </h1>
                            </div>
                          </div>
                          <p className="data-mono mt-5 max-w-3xl text-sm uppercase leading-6 text-muted-foreground">
                            {nextRace.circuitName} / {formatDate(nextRace.raceStartTime)} / Round {nextRace.round}
                          </p>
                        </div>

                        <div className="panel min-w-[240px] bg-surface-2/50 p-4">
                          <p className="label-eyebrow">{countdownLabel}</p>
                          {countdownTarget && (
                            <CountdownTimer targetDate={countdownTarget} className="data-mono mt-3 block text-3xl font-bold text-white" />
                          )}
                          <div className="mt-4 h-1 bg-surface-3">
                            <div className="h-full w-2/3 bg-signal" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid border border-border bg-surface-2/40 sm:grid-cols-4">
                      {[
                        ["Races left", upcoming.length],
                        ["Sprint weekends", sprintCount],
                        ["Open GP windows", openRaceWindows],
                        ["Open sprint windows", openSprintWindows],
                      ].map(([label, value]) => (
                        <div key={label} className="border-b border-border p-4 sm:border-b-0 sm:border-r sm:last:border-r-0">
                          <p className="label-eyebrow">{label}</p>
                          <p className="data-mono mt-2 text-2xl font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <aside className="border-t border-border bg-sidebar/70 lg:border-l lg:border-t-0">
                  <div className="border-b border-border p-4">
                    <p className="label-eyebrow">Session stack</p>
                  </div>
                  <div className="divide-y divide-border">
                    {nextRaceSessions.map(([label, date, Icon]) => (
                      <div key={label as string} className="grid grid-cols-[44px_1fr] gap-3 p-4">
                        <div className="flex h-11 w-11 items-center justify-center border border-border bg-surface-2 text-signal">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="display font-semibold text-white">{label as string}</p>
                          <p className="data-mono mt-1 text-xs text-muted-foreground">{formatTime(date as string, nextRace.timeZone)}</p>
                          <p className="data-mono mt-1 text-[10px] text-signal">{formatTime(date as string, "Asia/Kolkata")} IST</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 border-t border-border p-4">
                    {!isRaceLocked(nextRace) ? (
                      <Link to={`/predict/${nextRace.id}/race`} className="block">
                        <Button className="w-full" variant="signal" size="lg">
                          <Target className="h-4 w-4" />
                          Submit GP pick
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full" variant="cockpit" size="lg" disabled>
                        <Lock className="h-4 w-4" />
                        GP locked
                      </Button>
                    )}
                    {nextRace.sprintWeekend && !isSprintLocked(nextRace) && (
                      <Link to={`/predict/${nextRace.id}/sprint`} className="block">
                        <Button className="w-full" variant="cockpit" size="lg">
                          <Zap className="h-4 w-4" />
                          Submit sprint pick
                        </Button>
                      </Link>
                    )}
                  </div>
                </aside>
              </div>
            </section>

            <CockpitPanel
              className="mt-8 overflow-hidden"
              code="CAL.BOARD"
              title="Season queue"
              action={
                <span className="data-mono flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Gauge className="h-3.5 w-3.5 text-signal" />
                  {upcoming.length} EVENTS LOADED
                </span>
              }
            >
              <div className="hidden grid-cols-[78px_88px_1.4fr_1fr_140px_150px] border-b border-border px-4 py-3 data-mono text-[10px] uppercase text-muted-foreground lg:grid">
                <span>Round</span>
                <span>Flag</span>
                <span>Grand Prix</span>
                <span>Circuit</span>
                <span>Race date</span>
                <span className="text-right">Action</span>
              </div>
              <div className="divide-y divide-border">
                {upcoming.map((race, index) => {
                  const raceLocked = isRaceLocked(race);
                  return (
                    <div
                      key={race.id}
                      className={cn(
                        "grid gap-4 px-4 py-4 transition-colors hover:bg-surface-2/45 lg:grid-cols-[78px_88px_1.4fr_1fr_140px_150px] lg:items-center",
                        index === 0 && "bg-signal/5",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3 lg:block">
                        <span className="data-mono text-xl font-bold text-white">R{race.round}</span>
                        {index === 0 && <Badge className="lg:mt-2">Next</Badge>}
                      </div>
                      <div className="text-4xl lg:text-3xl">{race.countryFlag}</div>
                      <div className="min-w-0">
                        <p className="display truncate text-lg font-semibold text-white">{race.raceName}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {race.sprintWeekend && (
                            <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                              <Zap className="mr-1 h-3 w-3" />
                              Sprint
                            </Badge>
                          )}
                          {raceLocked ? (
                            <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                              <Lock className="mr-1 h-3 w-3" />
                              Locked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-signal/30 bg-signal/10 text-signal">Open</Badge>
                          )}
                        </div>
                      </div>
                      <div className="data-mono min-w-0 truncate text-xs uppercase text-muted-foreground">{race.circuitName}</div>
                      <div className="data-mono text-xs text-muted-foreground">{formatDate(race.raceStartTime)}</div>
                      <div className="flex justify-start lg:justify-end">
                        {!raceLocked && !race.cancelled ? (
                          <Link to={`/predict/${race.id}/race`}>
                            <Button variant="cockpit" size="sm">
                              Predict
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="data-mono border border-border bg-surface-2 px-3 py-2 text-[10px] uppercase text-muted-foreground">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CockpitPanel>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <LiveLeaderboard sessionKey={sessionKey} />
              <div className="grid gap-6">
                <FastestLap sessionKey={sessionKey} />
                <TelemetryChart sessionKey={sessionKey} driverNumber={1} />
              </div>
            </div>

            <div className="panel mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 p-4 data-mono text-[10px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <Cpu className="h-3 w-3 text-signal" />
                SYSTEM NOMINAL
              </span>
              <span>NEXT / R{nextRace.round}</span>
              <span>OPEN GP / {openRaceWindows}</span>
              <span className="lg:ml-auto">F1 PREDICTOR PRO / 2026 SEASON</span>
            </div>
          </>
        ) : (
          <section className="section-card text-center">
            <p className="display text-2xl font-semibold text-white">No upcoming races</p>
            <p className="data-mono mt-3 text-sm text-muted-foreground">Calendar feed is empty.</p>
          </section>
        )}
      </main>
    </PageShell>
  );
};

export default Dashboard;
