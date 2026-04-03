import { useEffect, useState } from "react";
import { Crown, Loader, Medal, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { UserPredictionsDialog } from "@/components/leaderboard/UserPredictionsDialog";
import { getLeaderboard } from "@/lib/api/leaderboard";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username?: string;
  email: string;
  totalPoints: number;
  correctWinners: number;
  exactPodiums: number;
  unexpectedAwards: number;
  predictionsSubmitted: number;
}

const getMedalEmoji = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
};

const getRowStyle = (rank: number) => {
  if (rank === 1) return "border-f1-gold/20 bg-[linear-gradient(90deg,rgba(255,209,102,0.13),transparent)]";
  if (rank === 2) return "border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.08),transparent)]";
  if (rank === 3) return "border-f1-bronze/20 bg-[linear-gradient(90deg,rgba(214,136,76,0.14),transparent)]";
  return "border-white/5 bg-white/[0.02]";
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
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load leaderboard";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isAuthenticated, navigate, authIsLoading]);

  return (
    <PageShell>
      <Navbar />
      <main className="container pb-12 pt-24 md:pt-32">
        <PageHeader
          eyebrow="Standings"
          title="Championship leaderboard"
          description="A cleaner race table for season-long bragging rights, with prediction details still one click away."
          badge="Season standings"
          stats={[
            { label: "Drivers", value: `${leaderboard.length}` },
            { label: "Top score", value: leaderboard[0] ? `${leaderboard[0].totalPoints} pts` : "TBD" },
            { label: "Podium locks", value: `${leaderboard.reduce((sum, entry) => sum + entry.exactPodiums, 0)}` },
            { label: "Season", value: "2026" },
          ]}
        />

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="section-card">
            <p className="page-eyebrow">Title fight</p>
            <p className="mt-3 flex items-center gap-3 font-heading text-xl text-white sm:text-2xl">
              <Crown className="h-6 w-6 text-f1-gold" />
              <span className="truncate">{leaderboard[0]?.username || leaderboard[0]?.name || "Waiting on the first leader"}</span>
            </p>
          </div>
          <div className="section-card">
            <p className="page-eyebrow">Total winner picks</p>
            <p className="mt-3 flex items-center gap-3 font-heading text-xl text-white sm:text-2xl">
              <Medal className="h-6 w-6 text-primary" />
              {leaderboard.reduce((sum, entry) => sum + entry.correctWinners, 0)}
            </p>
          </div>
          <div className="section-card">
            <p className="page-eyebrow">Current leader</p>
            <p className="mt-3 flex items-center gap-3 font-heading text-xl text-white sm:text-2xl">
              <Trophy className="h-6 w-6 text-primary" />
              {leaderboard[0]?.totalPoints ? `${leaderboard[0].totalPoints} pts` : "No score yet"}
            </p>
          </div>
        </section>

        <section className="section-card mt-8 overflow-hidden">
          {authIsLoading || isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-6">
              <p className="font-heading text-xl text-destructive">Error loading standings</p>
              <p className="mt-2 text-sm text-white/65">{error}</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center text-center">
              <p className="text-white/60">No predictions have been submitted yet.</p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[72px_1fr_120px_120px_120px_120px] gap-3 border-b border-white/10 px-4 py-4 text-[0.68rem] uppercase tracking-[0.24em] text-white/42 md:grid">
                <span>Pos</span>
                <span>Driver</span>
                <span className="text-right">Points</span>
                <span className="text-right">Correct P1</span>
                <span className="text-right">Exact Pods</span>
                <span className="text-right">Predictions</span>
              </div>
              <div className="mt-2 space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-[56px_1fr_76px] gap-3 rounded-[1.25rem] border px-3 py-4 transition-all hover:-translate-y-0.5 hover:border-white/15 sm:px-4 md:grid-cols-[72px_1fr_120px_120px_120px_120px] ${getRowStyle(
                      entry.rank,
                    )}`}
                  >
                    <span className="flex items-center text-base font-semibold text-white md:text-lg">
                      {getMedalEmoji(entry.rank) || entry.rank}
                    </span>
                    <button
                      type="button"
                      className="min-w-0 text-left"
                      onClick={() => setSelectedUser(entry)}
                      title="Click to view predictions"
                    >
                      <p className="truncate font-heading text-base text-white md:text-lg">{entry.username || entry.name}</p>
                      <p className="mt-1 hidden text-sm text-white/45 md:block">{entry.email}</p>
                    </button>
                    <span className="text-right text-base font-semibold tabular-nums text-white md:text-lg">{entry.totalPoints}</span>
                    <span className="hidden text-right text-sm tabular-nums text-white/60 md:block">{entry.correctWinners}</span>
                    <span className="hidden text-right text-sm tabular-nums text-white/60 md:block">{entry.exactPodiums}</span>
                    <span className="hidden text-right text-sm tabular-nums text-white/60 md:block">{entry.predictionsSubmitted}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs uppercase tracking-[0.2em] text-white/38">
          <Badge className="badge-signal">Live scoring</Badge>
          Points are calculated from actual race results
        </div>

        <UserPredictionsDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      </main>
    </PageShell>
  );
};

export default Leaderboard;
