import { useEffect, useState } from "react";
import { CalendarClock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import RaceCard from "@/components/dashboard/RaceCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getUpcomingRacesFromServer } from "@/lib/api/races";
import { type RaceWeekend } from "@/lib/data/raceCalendar";

const Dashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();
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

  const loadRaces = async () => {
    setRacesLoading(true);
    setError(null);
    try {
      const serverRaces = await getUpcomingRacesFromServer();
      const converted: RaceWeekend[] = serverRaces.map((race) => ({
        id: race.raceId,
        raceName: race.raceName,
        circuitName: race.circuitName,
        country: "",
        countryFlag: race.countryFlag,
        round: race.round,
        qualifyingStartTime: race.qualifyingStartTime,
        raceStartTime: race.raceStartTime,
        sprintWeekend: race.sprintWeekend,
        sprintQualifyingStartTime: race.sprintQualifyingStartTime,
        timeZone: race.timeZone,
        isLocked: false,
        isComplete: false,
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const featured = upcoming.slice(0, 3);
  const rest = upcoming.slice(3);

  return (
    <PageShell>
      <Navbar />
      <main className="container pb-12 pt-28 md:pt-32">
        <section className="hero-panel overflow-hidden">
          <div className="relative z-10">
            <p className="page-eyebrow">Dashboard</p>
            <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-heading text-3xl leading-tight text-white sm:text-4xl md:text-6xl">
                  F1 Predict
                  <span className="block text-gradient-f1">Race Calendar</span>
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">
                  Follow the upcoming weekends, watch lock deadlines, and go straight into your next prediction.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-0 xl:max-w-[480px]">
                <div className="panel-subtle">
                  <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/40">Races left</p>
                  <p className="mt-3 font-heading text-2xl text-white sm:text-3xl">{upcoming.length}</p>
                </div>
                <div className="panel-subtle">
                  <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/40">Sprint weekends</p>
                  <p className="mt-3 font-heading text-2xl text-white sm:text-3xl">
                    {upcoming.filter((race) => race.sprintWeekend).length}
                  </p>
                </div>
                <div className="panel-subtle">
                  <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/40">Status</p>
                  <p className="mt-3 font-heading text-2xl text-white sm:text-3xl">{error ? "Issue" : racesLoading ? "Syncing" : "Live"}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_center,rgba(255,79,50,0.22),transparent_65%)] xl:block" />
        </section>

        {error ? (
          <section className="section-card mt-8 border border-destructive/20 bg-destructive/10">
            <p className="font-heading text-xl text-destructive">Unable to load calendar</p>
            <p className="mt-3 text-sm text-white/65">{error}</p>
          </section>
        ) : racesLoading ? (
          <section className="section-card mt-8 flex min-h-[220px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-primary" />
              <p className="text-sm text-white/60">Loading the latest race schedule...</p>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-8">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="page-eyebrow">Up next</p>
                  <h2 className="mt-2 font-heading text-2xl text-white">Featured weekends</h2>
                </div>
                <Badge className="badge-signal w-fit">
                  <CalendarClock className="mr-1.5 h-3 w-3" />
                  Live calendar
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {featured.map((race, i) => (
                  <div key={race.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <RaceCard race={race} featured />
                  </div>
                ))}
              </div>
            </section>

            {rest.length > 0 && (
              <section className="mt-10 section-card">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="page-eyebrow">Full schedule</p>
                    <h2 className="mt-2 font-heading text-2xl text-white">Rest of the calendar</h2>
                  </div>
                  <Badge variant="outline" className="w-fit rounded-full border-f1-warning/30 bg-f1-warning/10 text-f1-warning">
                    <Zap className="mr-1.5 h-3 w-3" />
                    Sprint marked
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {rest.map((race) => (
                    <div key={race.id} className="panel-subtle min-w-0 transition-all hover:-translate-y-0.5 hover:border-white/15">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-2xl">
                          {race.countryFlag}
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading truncate text-base text-white">{race.raceName}</p>
                          <p className="text-sm text-white/50">
                            Round {race.round} •{" "}
                            {new Date(race.raceStartTime).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      {race.sprintWeekend && (
                        <div className="mt-3 flex justify-start sm:justify-end">
                          <Badge variant="outline" className="rounded-full border-f1-warning/30 bg-f1-warning/10 text-f1-warning">
                            <Zap className="h-3 w-3" />
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </PageShell>
  );
};

export default Dashboard;
