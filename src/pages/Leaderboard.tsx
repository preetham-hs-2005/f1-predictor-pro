import { useEffect, useState } from "react";
import { ArrowUpRight, Crown, Loader, ShieldCheck, Trophy, Users } from "lucide-react";
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
      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <section className="panel panel-corners overflow-hidden">
          <div className="relative min-h-[280px] p-5 sm:p-7 lg:p-8">
            <div className="checker absolute right-0 top-0 h-72 w-72 opacity-[0.05]" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_520px] xl:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="label-eyebrow">Championship standings</span>
                  <span className="h-px w-16 bg-border" />
                  <Badge className="badge-signal">2026 live table</Badge>
                </div>
                <h1 className="display mt-7 max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-7xl">
                  Title Wall
                </h1>
                <p className="data-mono mt-5 max-w-2xl text-sm uppercase leading-6 text-muted-foreground">
                  A full-grid points wall for checking rank, form, and every locked prediction from each player.
                </p>
              </div>

              <div className="grid border border-border bg-surface-2/40 sm:grid-cols-4">
                {[
                  ["Players", leaderboard.length],
                  ["Leader", leader?.username || leader?.name || "TBD"],
                  ["Entries", totalPredictions],
                  ["Winner hits", totalWinnerPicks],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 border-b border-border p-4 sm:border-b-0 sm:border-r sm:last:border-r-0">
                    <p className="label-eyebrow">{label}</p>
                    <p className="data-mono mt-2 truncate text-2xl font-bold text-white">{value}</p>
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
            <section className="mt-8 grid gap-4 lg:grid-cols-3">
              {topThree.map((entry) => (
                <button
                  key={entry.userId}
                  type="button"
                  onClick={() => setSelectedUser(entry)}
                  className={cn(
                    "panel panel-corners min-h-[180px] overflow-hidden p-5 text-left transition-colors hover:border-signal",
                    entry.rank === 1 && "bg-signal/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={cn("data-mono inline-flex border px-3 py-1 text-xs font-bold", rankStyle(entry.rank))}>
                        {rankName(entry.rank)}
                      </span>
                      <p className="display mt-5 truncate text-3xl font-bold text-white">{entry.username || entry.name}</p>
                      <p className="data-mono mt-2 truncate text-[10px] uppercase text-muted-foreground">{entry.email}</p>
                    </div>
                    {entry.rank === 1 ? <Crown className="h-8 w-8 text-signal" /> : <Trophy className="h-7 w-7 text-muted-foreground" />}
                  </div>
                  <div className="mt-6 grid grid-cols-3 border border-border bg-surface-2/40">
                    <div className="border-r border-border p-3">
                      <p className="label-eyebrow">Pts</p>
                      <p className="data-mono mt-2 text-xl font-bold text-white">{entry.totalPoints}</p>
                    </div>
                    <div className="border-r border-border p-3">
                      <p className="label-eyebrow">Wins</p>
                      <p className="data-mono mt-2 text-xl font-bold text-white">{entry.correctWinners}</p>
                    </div>
                    <div className="p-3">
                      <p className="label-eyebrow">Picks</p>
                      <p className="data-mono mt-2 text-xl font-bold text-white">{entry.predictionsSubmitted}</p>
                    </div>
                  </div>
                </button>
              ))}
            </section>

            <CockpitPanel
              className="mt-8 overflow-hidden"
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
              <div className="hidden grid-cols-[76px_1.2fr_1.7fr_120px_120px_120px_86px] border-b border-border px-4 py-3 data-mono text-[10px] uppercase text-muted-foreground xl:grid">
                <span>Rank</span>
                <span>Player</span>
                <span>Score trace</span>
                <span className="text-right">Points</span>
                <span className="text-right">Winner picks</span>
                <span className="text-right">Podiums</span>
                <span className="text-right">View</span>
              </div>
              <div className="divide-y divide-border">
                {leaderboard.map((entry) => {
                  const scorePercent = topScore ? Math.max((entry.totalPoints / topScore) * 100, 3) : 0;
                  return (
                    <button
                      key={entry.userId}
                      type="button"
                      onClick={() => setSelectedUser(entry)}
                      className="grid w-full gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-2/45 xl:grid-cols-[76px_1.2fr_1.7fr_120px_120px_120px_86px] xl:items-center"
                    >
                      <span className={cn("data-mono flex h-11 w-14 items-center justify-center border text-sm font-bold", rankStyle(entry.rank))}>
                        {rankName(entry.rank)}
                      </span>
                      <span className="min-w-0">
                        <span className="display block truncate text-lg font-semibold text-white">{entry.username || entry.name}</span>
                        <span className="data-mono mt-1 block truncate text-[10px] uppercase text-muted-foreground">{entry.predictionsSubmitted} predictions</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block h-2 bg-surface-3">
                          <span className="block h-full bg-signal" style={{ width: `${scorePercent}%` }} />
                        </span>
                        <span className="data-mono mt-2 flex justify-between text-[10px] uppercase text-muted-foreground">
                          <span>{entry.email}</span>
                          <span>{Math.round(scorePercent)}%</span>
                        </span>
                      </span>
                      <span className="data-mono text-left text-xl font-bold text-white xl:text-right">{entry.totalPoints}</span>
                      <span className="data-mono text-left text-sm text-muted-foreground xl:text-right">{entry.correctWinners}</span>
                      <span className="data-mono text-left text-sm text-muted-foreground xl:text-right">{entry.exactPodiums}</span>
                      <span className="flex xl:justify-end">
                        <span className="inline-flex h-9 w-9 items-center justify-center border border-border bg-surface-2 text-signal">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </span>
                    </button>
                  );
                })}
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
