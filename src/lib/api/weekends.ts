/**
 * Race Weekends API - Upcoming races and race information
 */

import { apiClient, ApiResponse } from "./client";

export interface OfficialResults {
  p1: string | null;
  p2: string | null;
  p3: string | null;
  pole: string | null;
  enteredAt: Date | null;
}

export interface RaceWeekend {
  id: string;
  raceName: string;
  circuitName: string;
  country: string;
  countryCode: string;
  round: number;
  qualifyingStartTime: Date;
  raceStartTime: Date;
  sprintWeekend: boolean;
  isLocked: boolean;
  officialResults: OfficialResults | null;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceWeekendResponse extends ApiResponse<RaceWeekend | RaceWeekend[]> {
  data?: RaceWeekend | RaceWeekend[];
}

/**
 * Get all race weekends
 */
export async function getRaceWeekends(): Promise<RaceWeekend[]> {
  const response = await apiClient.get<RaceWeekendResponse>("/api/weekends");

  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.error || "Failed to fetch race weekends");
  }

  return response.data;
}

/**
 * Get upcoming race weekends
 */
export async function getUpcomingRaces(): Promise<RaceWeekend[]> {
  const response = await apiClient.get<RaceWeekendResponse>(
    "/api/weekends/upcoming"
  );

  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.error || "Failed to fetch upcoming races");
  }

  return response.data;
}

/**
 * Get a specific race weekend
 */
export async function getRaceWeekend(raceId: string): Promise<RaceWeekend> {
  const response = await apiClient.get<RaceWeekendResponse>(
    `/api/weekends/${raceId}`
  );

  if (!response.success || Array.isArray(response.data)) {
    throw new Error(response.error || "Failed to fetch race weekend");
  }

  return response.data as RaceWeekend;
}
