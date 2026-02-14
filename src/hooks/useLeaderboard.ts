/**
 * Custom hook for leaderboard data
 */

import { useState, useEffect } from "react";
import { getLeaderboard, getUserLeaderboardPosition, LeaderboardEntry } from "@/lib/api/leaderboard";

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[] | null;
  userPosition: LeaderboardEntry | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLeaderboard(): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [board, position] = await Promise.all([
        getLeaderboard(),
        getUserLeaderboardPosition(),
      ]);
      setLeaderboard(board);
      setUserPosition(position);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch leaderboard";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refetch every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { leaderboard, userPosition, isLoading, error, refetch: fetchData };
}
