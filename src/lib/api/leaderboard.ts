/**
 * Leaderboard API - Leaderboard and standings data
 */

import { apiClient, ApiResponse } from "./client";

export interface LeaderboardEntry {
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

export interface LeaderboardResponse extends ApiResponse<LeaderboardEntry[]> {
  data?: LeaderboardEntry[];
}

/**
 * Get leaderboard standings
 */
export async function getLeaderboard(
  limit?: number
): Promise<LeaderboardEntry[]> {
  const url = limit ? `/api/leaderboard?limit=${limit}` : "/api/leaderboard";
  const response = await apiClient.get<LeaderboardResponse>(url);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch leaderboard");
  }

  return response.data;
}

/**
 * Get user's leaderboard position
 */
export async function getUserLeaderboardPosition(): Promise<LeaderboardEntry> {
  const response = await apiClient.get<ApiResponse<LeaderboardEntry>>(
    "/api/leaderboard/me"
  );

  if (!response.success || !response.data) {
    throw new Error(
      response.error || "Failed to fetch user leaderboard position"
    );
  }

  return response.data;
}
