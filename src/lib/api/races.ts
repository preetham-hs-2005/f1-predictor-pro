/**
 * Races API - Fetch races data from server
 */

import client from "./client";

export interface ServerRace {
  id: string;
  raceId: string;
  raceName: string;
  round: number;
  country?: string;
  countryFlag: string;
  circuitName: string;
  qualifyingStartTime: string;
  raceStartTime: string;
  timeZone: string;
  sprintWeekend: boolean;
  sprintQualifyingStartTime?: string | null;
  cancelled: boolean;
  isLocked?: boolean;
  isComplete?: boolean;
}

/**
 * Get all races from server
 */
export async function getAllRaces(): Promise<ServerRace[]> {
  try {
    console.log("[API] Fetching races from /api/admin/races");
    const response = await client.request<{ success: boolean; data: ServerRace[] }>(
      "/api/admin/races"
    );
    console.log("[API] Races response:", response);
    
    if (!response.data) {
      console.warn("[API] No data in response");
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error("[API] Failed to fetch races from server:", error);
    return [];
  }
}

/**
 * Get upcoming races (not completed, not cancelled)
 */
export async function getUpcomingRacesFromServer(): Promise<ServerRace[]> {
  try {
    const races = await getAllRaces();
    console.log("[API] All races:", races.length, races);
    
    const now = new Date();
    console.log("[API] Current time:", now);
    
    const upcoming = races
      .filter((r) => {
        const raceTime = new Date(r.raceStartTime);
        const isFuture = raceTime > now;
        const notCancelled = !r.cancelled;
        console.log(`[API] Race ${r.raceId}: future=${isFuture}, notCancelled=${notCancelled}, time=${raceTime}`);
        return isFuture && notCancelled;
      })
      .sort((a, b) => a.round - b.round);
    
    console.log("[API] Upcoming races:", upcoming.length);
    return upcoming;
  } catch (error) {
    console.error("[API] Failed to get upcoming races:", error);
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
    console.error("[API] Failed to get race by ID:", error);
    return null;
  }
}
