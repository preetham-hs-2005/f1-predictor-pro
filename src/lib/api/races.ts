/**
 * Races API - Fetch races data from server
 */

import client from "./client";

export interface ServerRace {
  id: string;
  raceId: string;
  raceName: string;
  round: number;
  countryFlag: string;
  circuitName: string;
  qualifyingStartTime: string;
  raceStartTime: string;
  timeZone: string;
  sprintWeekend: boolean;
  sprintQualifyingStartTime?: string;
  cancelled: boolean;
}

/**
 * Get all races from server
 */
export async function getAllRaces(): Promise<ServerRace[]> {
  try {
    const response = await client.request<{ success: boolean; data: ServerRace[] }>(
      "/api/admin/races"
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch races from server:", error);
    return [];
  }
}

/**
 * Get upcoming races (not completed, not cancelled)
 */
export async function getUpcomingRacesFromServer(): Promise<ServerRace[]> {
  try {
    const races = await getAllRaces();
    const now = new Date();
    return races
      .filter((r) => !r.cancelled && new Date(r.raceStartTime) > now)
      .sort((a, b) => a.round - b.round);
  } catch (error) {
    console.error("Failed to get upcoming races:", error);
    return [];
  }
}

/**
 * Get race by ID from server
 */
export async function getRaceByIdFromServer(raceId: string): Promise<ServerRace | null> {
  try {
    const races = await getAllRaces();
    return races.find((r) => r.raceId === raceId) || null;
  } catch (error) {
    console.error("Failed to get race by ID:", error);
    return null;
  }
}
