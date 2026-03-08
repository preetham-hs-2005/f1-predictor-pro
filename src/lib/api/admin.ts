/**
 * Admin API functions
 * Handles all admin-related API calls
 */

import client from "./client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  totalPoints: number;
  predictions: number;
  createdAt?: string;
  hidden?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  regularUsers: number;
  totalPredictions: number;
  totalResults: number;
  totalScores: number;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    totalPoints: number;
  }>;
}

export interface AdminPrediction {
  id: string;
  raceId: string;
  type: "race" | "sprint";
  userId: string;
  userName: string;
  userEmail: string;
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  unexpected: string;
  score: number;
  createdAt?: string;
}

export interface RaceResult {
  id: string;
  raceId: string;
  type: "race" | "sprint";
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScoreEntry {
  id: string;
  userId: string;
  userName: string;
  raceId: string;
  type: "race" | "sprint";
  p1Points: number;
  p2Points: number;
  p3Points: number;
  polePoints: number;
  podiumBonusPoints: number;
  unexpectedPoints: number;
  total: number;
  createdAt?: string;
}

/**
 * Get all users with statistics
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const response = await client.request<{ success: boolean; data: AdminUser[] }>(
      "/api/admin/users"
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
    return [];
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const response = await client.request<{ success: boolean; data: AdminStats }>(
      "/api/admin/stats"
    );
    return response.data || null;
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return null;
  }
}

/**
 * Toggle user admin role
 */
export async function toggleUserAdminRole(userId: string): Promise<boolean> {
  try {
    const response = await client.request<{
      success: boolean;
      data: { newRole: string };
    }>(`/api/admin/users/${userId}/role`, {
      method: "POST",
    });
    return response.success;
  } catch (error) {
    console.error("Failed to toggle user role:", error);
    return false;
  }
}

/**
 * Delete a user
 */
export async function deleteAdminUser(userId: string): Promise<boolean> {
  try {
    const response = await client.request<{ success: boolean }>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    return response.success;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
}

/**
 * Get all predictions
 */
export async function getAdminPredictions(): Promise<AdminPrediction[]> {
  try {
    const response = await client.request<{ success: boolean; data: AdminPrediction[] }>(
      "/api/admin/predictions"
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch admin predictions:", error);
    return [];
  }
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(): Promise<boolean> {
  try {
    const response = await client.request<{ success: boolean }>(
      "/api/admin/cleanup-test-data",
      { method: "DELETE" }
    );
    return response.success;
  } catch (error) {
    console.error("Failed to cleanup test data:", error);
    return false;
  }
}

/**
 * Get all race results from MongoDB
 */
export async function getAdminResults(): Promise<RaceResult[]> {
  try {
    const response = await client.request<{ success: boolean; data: RaceResult[] }>(
      "/api/admin/results"
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch admin results:", error);
    return [];
  }
}

/**
 * Save race result to MongoDB
 */
export async function saveAdminResult(result: Omit<RaceResult, "id" | "createdAt" | "updatedAt">): Promise<boolean> {
  try {
    const response = await client.request<{ success: boolean }>(
      "/api/admin/results",
      {
        method: "POST",
        body: JSON.stringify(result),
      }
    );
    return response.success;
  } catch (error) {
    console.error("Failed to save result:", error);
    return false;
  }
}

/**
 * Get all scores
 */
export async function getAdminScores(): Promise<ScoreEntry[]> {
  try {
    const response = await client.request<{ success: boolean; data: ScoreEntry[] }>(
      "/api/admin/scores"
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch admin scores:", error);
    return [];
  }
}
/**
 * Get all predictions for a specific user
 */
export async function getUserPredictions(userId: string): Promise<AdminPrediction[]> {
  try {
    const response = await client.request<{ success: boolean; data: AdminPrediction[] }>(
      `/api/admin/users/${userId}/predictions`
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch user predictions:", error);
    return [];
  }
}

/**
 * Toggle user leaderboard visibility
 */
export async function toggleUserLeaderboardVisibility(userId: string): Promise<boolean> {
  try {
    const response = await client.request<{ success: boolean }>(
      `/api/admin/users/${userId}/visibility`,
      { method: "POST" }
    );
    return response.success;
  } catch (error) {
    console.error("Failed to toggle user visibility:", error);
    return false;
  }
}

/**
 * Award unexpected statement points to a user for a race
 */
export async function awardUnexpectedPoints(
  userId: string,
  raceId: string,
  type: "race" | "sprint"
): Promise<boolean> {
  try {
    const response = await client.request<{ success: boolean }>(
      `/api/admin/scores/${userId}/award-unexpected`,
      {
        method: "POST",
        body: JSON.stringify({ raceId, type }),
      }
    );
    return response.success;
  } catch (error) {
    console.error("Failed to award unexpected points:", error);
    return false;
  }
}

/**
 * Revoke unexpected statement points from a user for a race
 */
export async function revokeUnexpectedPoints(
  userId: string,
  raceId: string,
  type: "race" | "sprint"
): Promise<boolean> {
  try {
    const response = await client.request<{ success: boolean }>(
      `/api/admin/scores/${userId}/revoke-unexpected`,
      {
        method: "POST",
        body: JSON.stringify({ raceId, type }),
      }
    );
    return response.success;
  } catch (error) {
    console.error("Failed to revoke unexpected points:", error);
    return false;
  }
}

/**
 * Recalculate all scores for a specific race (fix missing predictions)
 */
export async function rescoreRace(
  raceId: string,
  type: "race" | "sprint"
): Promise<{ success: boolean; message?: string; scoredCount?: number }> {
  try {
    const response = await client.request<{ success: boolean; message?: string; scoredCount?: number }>(
      "/api/admin/rescore-race",
      {
        method: "POST",
        body: JSON.stringify({ raceId, type }),
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to rescore race:", error);
    return { success: false, message: "Failed to rescore race" };
  }
}