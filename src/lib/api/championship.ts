/**
 * Championship API - F1 Driver and Constructor standings
 */

import { apiClient } from "./client";

export interface DriverStanding {
  position: number;
  driverId: string;
  driverName: string;
  teamColor: string;
  countryFlag: string;
  points: number;
  wins: number;
  podiums: number;
}

export interface ConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
}

/**
 * Get F1 driver championship standings
 */
export async function getDriverStandings(): Promise<DriverStanding[]> {
  try {
    const response = await apiClient.get<DriverStanding[]>("/api/leaderboard/championship/drivers");
    return response.success && Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch driver standings:", error);
    return [];
  }
}

/**
 * Get F1 constructor championship standings
 */
export async function getConstructorStandings(): Promise<ConstructorStanding[]> {
  try {
    const response = await apiClient.get<ConstructorStanding[]>("/api/leaderboard/championship/constructors");
    return response.success && Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch constructor standings:", error);
    return [];
  }
}
