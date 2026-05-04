import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader, Medal, Trophy, Users } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getF1Standings, type F1DriverStanding, type F1TeamStanding } from "@/lib/api/formula1";
import { f1Drivers, f1Teams } from "@/lib/data/f1Grid";
import { cn } from "@/lib/utils";

const teamColorByName = new Map(f1Teams.map((team) => [team.name, team.teamColor]));
const driverNumberByName = new Map(f1Drivers.map((driver) => [driver.name, driver.number]));

const fallbackDrivers: F1DriverStanding[] = f1Drivers.map((driver, index) => ({
  position: String(index + 1),
  driver: driver.name,
  shortName: driver.shortName,
  nationality: driver.countryCode,
  team: driver.team,
  points: 0,
}));

const fallbackTeams: F1TeamStanding[] = f1Teams.map((team, index) => ({
  position: String(index + 1),
  team: team.name,
  points: 0,
}));

const Standings = () => {
  const [drivers, setDrivers] = useState<F1DriverStanding[]>(fallbackDrivers);
  const [teams, setTeams] = useState<F1TeamStanding[]>(fallbackTeams);
  const [source, setSource] = useState("Formula1.com");
  const [updatedAt, setUpdatedAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const standings = await getF1Standings();
        if (standings.drivers.length) setDrivers(standings.drivers);
        if (standings.teams.length) setTeams(standings.teams);
        setSource(standings.source);
        setUpdatedAt(standings.updatedAt);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load live standings");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const leader = drivers[0];
  const leadingTeam = teams[0];
  const lastUpdated = useMemo(
    () =>
      updatedAt
        ? new Date(updatedAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "Live source pending",
    [updatedAt],
  );

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-[1500px] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <section className="panel panel-corners overflow-hidden">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_420px] lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="label-eyebrow">Live championship table</span>
                <span className="h-px w-16 bg-border" />
                <Badge className="badge-signal">{source}</Badge>
              </div>
              <h1 className="display mt-6 max-w-4xl text-4xl font-bold leading-[0.95] text-white sm:text-6xl">
                Championship Standings
              </h1>
              <p className="data-mono mt-5 max-w-3xl text-sm uppercase leading-6 text-muted-foreground">
                Actual driver and constructor championship points, refreshed from the official Formula 1 results feed.
              </p>
            </div>

            <div className="border border-border bg-surface-2/45">
              <div className="grid gap-px bg-border sm:grid-cols-3">
                {[
                  ["Driver leader", leader ? `${leader.driver} / ${leader.points} pts` : "-", Users],
                  ["Team leader", leadingTeam ? `${leadingTeam.team} / ${leadingTeam.points} pts` : "-", Trophy],
                  ["Drivers", `${drivers.length} classified`, Medal],
                ].map(([label, value, Icon]) => (
                  <div key={String(label)} className="min-w-0 bg-surface-2/95 p-4">
                    <Icon className="h-4 w-4 text-signal" />
                    <p className="mt-4 text-base font-bold leading-6 text-white">{value}</p>
                    <p className="label-eyebrow mt-2">{label}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-3">
                <p className="label-eyebrow">Last updated</p>
                <p className="data-mono mt-1 text-sm font-semibold text-white">{lastUpdated}</p>
              </div>
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="section-card mt-6 flex items-center gap-3">
            <Loader className="h-4 w-4 animate-spin text-signal" />
            <span className="data-mono text-sm uppercase text-muted-foreground">Loading live standings...</span>
          </div>
        )}

        {error && (
          <div className="section-card mt-6 flex items-center gap-3 border-warning/30 bg-warning/10 text-warning">
            <AlertCircle className="h-4 w-4" />
            <span className="data-mono text-sm uppercase">Using local grid fallback. {error}</span>
          </div>
        )}

        <Tabs defaultValue="drivers" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 border border-border bg-surface-1 p-1">
            <TabsTrigger value="drivers" className="data-mono uppercase">
              Drivers
            </TabsTrigger>
            <TabsTrigger value="constructors" className="data-mono uppercase">
              Constructors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="mt-6">
            <section className="panel overflow-hidden">
              <div className="hidden grid-cols-[72px_88px_1.2fr_1fr_100px] border-b border-border px-4 py-3 data-mono text-[10px] uppercase text-muted-foreground lg:grid">
                <span>Pos</span>
                <span>No.</span>
                <span>Driver</span>
                <span>Team</span>
                <span className="text-right">Pts</span>
              </div>
              <div className="divide-y divide-border">
                {drivers.map((driver, index) => {
                  const teamColor = teamColorByName.get(driver.team) || "#9CA3AF";
                  return (
                    <div
                      key={`${driver.position}-${driver.driver}`}
                      className="grid gap-4 px-4 py-4 transition-colors hover:bg-surface-2/45 lg:grid-cols-[72px_88px_1.2fr_1fr_100px] lg:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "data-mono flex h-9 w-9 items-center justify-center border bg-surface-2 text-sm font-bold",
                            index < 3 ? "border-signal/50 text-signal" : "border-border text-white",
                          )}
                        >
                          {driver.position}
                        </span>
                      </div>
                      <div className="data-mono text-xl font-bold text-white">#{driverNumberByName.get(driver.driver) || "--"}</div>
                      <div className="min-w-0">
                        <p className="display truncate text-lg font-semibold text-white">{driver.driver}</p>
                        <p className="data-mono mt-1 text-[10px] uppercase text-muted-foreground">
                          {driver.shortName} / {driver.nationality}
                        </p>
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-9 w-1.5 shrink-0" style={{ backgroundColor: teamColor }} />
                        <span className="truncate text-sm font-medium text-white/85">{driver.team}</span>
                      </div>
                      <div className="data-mono text-left text-2xl font-bold text-white lg:text-right">{driver.points}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="constructors" className="mt-6">
            <section className="space-y-2">
              {teams.map((team) => {
                const teamMeta = f1Teams.find((item) => item.name === team.team);
                const drivers = teamMeta?.drivers || [];

                return (
                  <article
                    key={team.team}
                    className="group relative flex items-center gap-5 overflow-hidden border border-border bg-surface-1 px-5 py-4 transition-colors duration-200 hover:bg-surface-2/60 sm:gap-7 sm:px-6 sm:py-5"
                  >

                    {/* Position */}
                    <div className="data-mono flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-surface-2 text-base font-bold text-white">
                      {team.position}
                    </div>

                    {/* Team name + drivers */}
                    <div className="min-w-0 flex-1">
                      <h2 className="display truncate text-xl font-semibold text-white sm:text-2xl">
                        {team.team}
                      </h2>
                      <p className="data-mono mt-0.5 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                        {drivers.length > 0
                          ? drivers.join("  ·  ")
                          : "Lineup unavailable"}
                      </p>
                    </div>

                    {/* Points — always white, no team colour */}
                    <div className="shrink-0 text-right">
                      <span className="data-mono block text-3xl font-black text-white sm:text-4xl">
                        {team.points}
                      </span>
                      <span className="data-mono block text-[9px] uppercase tracking-widest text-muted-foreground">
                        pts
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </PageShell>
  );
};

export default Standings;
