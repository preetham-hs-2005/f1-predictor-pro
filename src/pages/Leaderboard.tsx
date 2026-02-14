import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { TrendingUp, TrendingDown, Minus, Loader } from "lucide-react";
import { getLeaderboard } from "@/lib/api/leaderboard";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
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
  if (rank === 1) return "bg-gradient-to-r from-[hsl(var(--f1-gold))]/10 to-transparent border-l-2 border-l-f1-gold";
  if (rank === 2) return "bg-gradient-to-r from-[hsl(var(--f1-silver))]/5 to-transparent border-l-2 border-l-f1-silver";
  if (rank === 3) return "bg-gradient-to-r from-[hsl(var(--f1-bronze))]/10 to-transparent border-l-2 border-l-f1-bronze";
  return "border-l-2 border-l-transparent";
};

const Leaderboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        console.error("Leaderboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
    // Refetch every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12">
        <div className="mb-8 animate-slide-up">
          <h1 className="f1-heading text-3xl mb-2">Championship Standings</h1>
          <p className="text-muted-foreground text-sm">Season 2026 leaderboard</p>
        </div>

        {isLoading ? (
          <div className="glass rounded-xl overflow-hidden animate-slide-up p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass rounded-xl overflow-hidden animate-slide-up p-6 border border-destructive/20 bg-destructive/5">
            <p className="text-destructive font-semibold mb-2">Error Loading Leaderboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass rounded-xl overflow-hidden animate-slide-up p-12 text-center">
            <p className="text-muted-foreground">No predictions have been submitted yet</p>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="grid grid-cols-[60px_1fr_80px] md:grid-cols-[60px_1fr_100px_100px_100px_100px] gap-2 px-4 py-3 border-b border-border/50 text-xs f1-heading text-muted-foreground">
              <span>Pos</span>
              <span>Driver</span>
              <span className="text-right">Points</span>
              <span className="text-right hidden md:block">Correct P1</span>
              <span className="text-right hidden md:block">Exact Pods</span>
              <span className="text-right hidden md:block">Predictions</span>
            </div>

            {/* Rows */}
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`grid grid-cols-[60px_1fr_80px] md:grid-cols-[60px_1fr_100px_100px_100px_100px] gap-2 px-4 py-3.5 items-center transition-colors hover:bg-accent/30 ${getRowStyle(
                  entry.rank
                )}`}
              >
                <span className="text-sm font-bold">
                  {getMedalEmoji(entry.rank) || entry.rank}
                </span>
                <div className="text-sm font-semibold truncate">
                  <div className="truncate">{entry.name}</div>
                </div>
                <span className="text-right text-sm font-bold tabular-nums">
                  {entry.totalPoints}
                </span>
                <span className="text-right text-sm text-muted-foreground tabular-nums hidden md:block">
                  {entry.correctWinners}
                </span>
                <span className="text-right text-sm text-muted-foreground tabular-nums hidden md:block">
                  {entry.exactPodiums}
                </span>
                <span className="text-right text-sm text-muted-foreground tabular-nums hidden md:block">
                  {entry.predictionsSubmitted}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Points are calculated from actual race results · Updated every 30 seconds
        </p>
      </main>
    </div>
  );
};

export default Leaderboard;
