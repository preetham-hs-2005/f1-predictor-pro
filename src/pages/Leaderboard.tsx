import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalPoints: number;
  thisWeekend: number;
  correctWinners: number;
  exactPodiums: number;
  trend: "up" | "down" | "same";
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Alex Thompson", totalPoints: 145, thisWeekend: 45, correctWinners: 3, exactPodiums: 1, trend: "up" },
  { rank: 2, name: "Sarah Chen", totalPoints: 130, thisWeekend: 25, correctWinners: 2, exactPodiums: 1, trend: "down" },
  { rank: 3, name: "James Wilson", totalPoints: 115, thisWeekend: 35, correctWinners: 2, exactPodiums: 0, trend: "same" },
  { rank: 4, name: "Maria Garcia", totalPoints: 100, thisWeekend: 20, correctWinners: 1, exactPodiums: 1, trend: "up" },
  { rank: 5, name: "Tom Anderson", totalPoints: 85, thisWeekend: 15, correctWinners: 1, exactPodiums: 0, trend: "down" },
  { rank: 6, name: "Emily Davis", totalPoints: 70, thisWeekend: 30, correctWinners: 1, exactPodiums: 0, trend: "up" },
  { rank: 7, name: "Ryan Park", totalPoints: 55, thisWeekend: 10, correctWinners: 0, exactPodiums: 0, trend: "same" },
  { rank: 8, name: "Lisa Brown", totalPoints: 40, thisWeekend: 0, correctWinners: 0, exactPodiums: 0, trend: "down" },
];

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

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-f1-success" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-primary" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

const Leaderboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12">
        <div className="mb-8 animate-slide-up">
          <h1 className="f1-heading text-3xl mb-2">Championship Standings</h1>
          <p className="text-muted-foreground text-sm">Season 2026 leaderboard</p>
        </div>

        <div className="glass rounded-xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_80px_80px] md:grid-cols-[60px_1fr_100px_100px_100px_100px_60px] gap-2 px-4 py-3 border-b border-border/50 text-xs f1-heading text-muted-foreground">
            <span>Pos</span>
            <span>Driver</span>
            <span className="text-right">Points</span>
            <span className="text-right">Last</span>
            <span className="text-right hidden md:block">Wins</span>
            <span className="text-right hidden md:block">Podiums</span>
            <span className="text-right hidden md:block">Trend</span>
          </div>

          {/* Rows */}
          {mockLeaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`grid grid-cols-[60px_1fr_80px_80px] md:grid-cols-[60px_1fr_100px_100px_100px_100px_60px] gap-2 px-4 py-3.5 items-center transition-colors hover:bg-accent/30 ${getRowStyle(
                entry.rank
              )}`}
            >
              <span className="text-sm font-bold">
                {getMedalEmoji(entry.rank) || entry.rank}
              </span>
              <span className="text-sm font-semibold truncate">{entry.name}</span>
              <span className="text-right text-sm font-bold tabular-nums">
                {entry.totalPoints}
              </span>
              <span className="text-right text-sm text-muted-foreground tabular-nums">
                {entry.thisWeekend > 0 ? `+${entry.thisWeekend}` : "—"}
              </span>
              <span className="text-right text-sm text-muted-foreground tabular-nums hidden md:block">
                {entry.correctWinners}
              </span>
              <span className="text-right text-sm text-muted-foreground tabular-nums hidden md:block">
                {entry.exactPodiums}
              </span>
              <span className="flex justify-end hidden md:flex">
                <TrendIcon trend={entry.trend} />
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Points are updated after each race · Demo data shown
        </p>
      </main>
    </div>
  );
};

export default Leaderboard;
