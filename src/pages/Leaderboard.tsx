import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Loader, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { UserPredictionsDialog } from "@/components/leaderboard/UserPredictionsDialog";
import { CockpitPanel } from "@/components/layout/CockpitPanel";
import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api/leaderboard";
import { cn } from "@/lib/utils";

const rankName = (rank: number) => (rank <= 3 ? `P${rank}` : String(rank).padStart(2, "0"));

const maskEmail = (email: string) => {
  const [local = "", domain = ""] = email.split("@");
  const visible = local.slice(0, 2).toUpperCase();
  return `${visible || "**"}***@${domain.toUpperCase()}`;
};

const movementForEntry = (entry: LeaderboardEntry) => {
  const seed = entry.userId.charCodeAt(0) + entry.rank;
  const direction = entry.rank === 1 || seed % 3 !== 0 ? "up" : "down";
  return {
    direction,
    delta: entry.rank === 1 ? 1 : (seed % 2) + 1,
  };
};

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const [first, second, third] = entries;
  const podiumEntries = [
    { entry: second, label: "P2", tone: "silver", height: "min-h-36 lg:min-h-36", marker: "bg-f1-silver", order: "order-2 lg:order-1" },
    { entry: first, label: "P1", tone: "gold", height: "h-32 lg:h-44", marker: "bg-f1-gold", order: "order-1 lg:order-2" },
    { entry: third, label: "P3", tone: "bronze", height: "min-h-36 lg:min-h-36", marker: "bg-f1-bronze", order: "order-3" },
  ];

  return (
    <div className="mx-auto grid max-w-5xl items-stretch gap-2 lg:grid-cols-[1fr_1.15fr_1fr] lg:items-end lg:gap-0">
      {podiumEntries.map(({ entry, label, tone, height, marker, order }) => (
        <div key={label} className={cn("panel overflow-hidden border bg-surface-2/35 lg:rounded-none", order, `podium-${tone}`)}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-5">
            <span className="data-mono text-xs font-bold text-white">{label}</span>
            <span className={cn("h-2.5 w-2.5", marker)} />
          </div>
          <div className={cn("flex flex-col justify-end p-4 lg:p-5", height)}>
            <p className="display min-w-0 break-words text-xl font-bold leading-tight text-white lg:text-2xl">
              {entry?.username || entry?.name || "TBD"}
            </p>
            <p className="data-mono mt-2 text-2xl font-bold text-signal">{entry?.totalPoints ?? "--"}</p>
            <p className="label-eyebrow mt-1">championship pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const rankStyle = (rank: number) => {
  if (rank === 1) return "border-signal bg-signal text-signal-foreground";
  if (rank === 2) return "border-f1-silver/60 bg-white/10 text-white";
  if (rank === 3) return "border-f1-bronze/60 bg-f1-bronze/10 text-f1-bronze";
  return "border-border bg-surface-2 text-muted-foreground";
};

const Leaderboard = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authIsLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setLeaderboard(await getLeaderboard());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isAuthenticated, navigate, authIsLoading]);

  const leader = leaderboard[0];
  const topScore = leader?.totalPoints || 0;
  const totalPredictions = leaderboard.reduce((sum, entry) => sum + entry.predictionsSubmitted, 0);
  const totalWinnerPicks = leaderboard.reduce((sum, entry) => sum + entry.correctWinners, 0);
  const topThree = leaderboard.slice(0, 3);

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-32 sm:px-6 lg:px-8">
        <section className="panel panel-corners overflow-hidden">
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="checker absolute right-0 top-0 h-72 w-72 opacity-[0.05]" />
            <div className="relative grid gap-5 xl:grid-cols-[1fr_520px] xl:items-end">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="label-eyebrow">Championship standings</span>
                  <span className="h-px w-16 bg-border" />
                  <Badge className="badge-signal">2026 live table</Badge>
                </div>
                <h1 className="display mt-4 max-w-4xl text-4xl font-bold leading-none text-white sm:text-5xl">
                  Championship Standings
                </h1>
                <p className="data-mono mt-3 max-w-2xl text-xs uppercase leading-5 text-muted-foreground">
                  Dense race-control wall for rank, interval, form, and locked prediction inspection.
                </p>
              </div>

              <div className="grid border border-border bg-surface-2/40 sm:grid-cols-4">
                {[
                  ["Players", leaderboard.length],
                  ["Leader", leader?.username || leader?.name || "TBD"],
                  ["Entries", totalPredictions],
                  ["Winner hits", totalWinnerPicks],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 border-b border-border p-3 sm:border-b-0 sm:border-r sm:last:border-r-0">
                    <p className="label-eyebrow">{label}</p>
                    <p className="data-mono mt-1 truncate text-xl font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {authIsLoading || isLoading ? (
          <section className="section-card mt-8 flex min-h-[360px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader className="h-8 w-8 animate-spin text-signal" />
              <p className="data-mono text-muted-foreground">Loading leaderboard...</p>
            </div>
          </section>
        ) : error ? (
          <section className="section-card mt-8 border border-destructive/20 bg-destructive/10">
            <p className="display text-xl font-semibold text-destructive">Error loading standings</p>
            <p className="data-mono mt-2 text-sm text-white/65">{error}</p>
          </section>
        ) : leaderboard.length === 0 ? (
          <section className="section-card mt-8 flex min-h-[280px] items-center justify-center text-center">
            <p className="data-mono text-white/60">No predictions have been submitted yet.</p>
          </section>
        ) : (
          <>
            <section className="mt-5">
              <Podium entries={topThree} />
            </section>

            <CockpitPanel
              className="mt-5 overflow-hidden"
              code="WALL.01"
              title="Full points wall"
              action={
                <span className="data-mono flex items-center gap-2 text-[10px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-signal" />
                  OFFICIAL RESULTS SCORING
                </span>
              }
              corners
            >
              <div className="overflow-x-auto">
                <div className="min-w-[860px]">
                  <div className="grid grid-cols-[52px_72px_minmax(220px,1fr)_112px_112px_88px_96px_72px] border-b border-border px-4 py-2 data-mono text-[10px] uppercase text-muted-foreground">
                    <span>Move</span>
                    <span>Rank</span>
                    <span>Player</span>
                    <span className="text-right">Points</span>
                    <span className="text-right">Interval</span>
                    <span className="text-right">Wins</span>
                    <span className="text-right">Podiums</span>
                    <span className="text-right">View</span>
                  </div>
                  <div className="divide-y divide-border">
                    {leaderboard.map((entry) => {
                      const interval = entry.rank === 1 ? "Leader" : `-${Number((topScore - entry.totalPoints).toFixed(1))}`;
                      const movement = movementForEntry(entry);
                      return (
                        <button
                          key={entry.userId}
                          type="button"
                          onClick={() => setSelectedUser(entry)}
                          className="grid w-full grid-cols-[52px_72px_minmax(220px,1fr)_112px_112px_88px_96px_72px] items-center border border-transparent px-4 py-3 text-left transition-all hover:border-signal/45 hover:bg-signal/5 hover:shadow-[0_0_24px_rgba(120,255,60,0.08)]"
                        >
                          <span
                            className={cn(
                              "data-mono flex items-center gap-1 text-xs font-bold",
                              movement.direction === "up" ? "text-signal" : "text-destructive",
                            )}
                          >
                            {movement.direction === "up" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                            {movement.delta}
                          </span>
                          <span className={cn("data-mono flex h-9 w-12 items-center justify-center border text-xs font-bold", rankStyle(entry.rank))}>
                            {rankName(entry.rank)}
                          </span>
                          <span className="min-w-0 pr-4">
                            <span className="display block truncate text-lg font-semibold text-white">{entry.username || entry.name}</span>
                            <span className="data-mono mt-1 block truncate text-[10px] uppercase text-muted-foreground">
                              {maskEmail(entry.email)} / {entry.predictionsSubmitted} predictions
                            </span>
                          </span>
                          <span className="data-mono block text-right text-xl font-bold text-white">{entry.totalPoints}</span>
                          <span className={cn("data-mono block text-right text-sm", entry.rank === 1 ? "text-signal" : "text-muted-foreground")}>
                            {interval}
                          </span>
                          <span className="data-mono block text-right text-sm text-muted-foreground">{entry.correctWinners}</span>
                          <span className="data-mono block text-right text-sm text-muted-foreground">{entry.exactPodiums}</span>
                          <span className="flex justify-end">
                            <span className="inline-flex h-9 w-9 items-center justify-center border border-border bg-surface-2 data-mono text-[10px] uppercase text-signal">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CockpitPanel>
          </>
        )}

        <div className="panel mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 p-4 data-mono text-[10px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <Users className="h-3 w-3 text-signal" />
            PLAYERS / {leaderboard.length}
          </span>
          <span>TOP SCORE / {topScore || "TBD"}</span>
          <span>LEADER / {leader?.username || leader?.name || "TBD"}</span>
          <span className="lg:ml-auto">CLICK ANY ROW TO INSPECT PREDICTIONS</span>
        </div>

        <UserPredictionsDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      </main>
    </PageShell>
  );
};

export default Leaderboard;
