import client from "./client";

export interface F1DriverStanding {
  position: string;
  driver: string;
  shortName: string;
  nationality: string;
  team: string;
  points: number;
}

export interface F1TeamStanding {
  position: string;
  team: string;
  points: number;
}

export interface F1StandingsResponse {
  source: string;
  updatedAt: string;
  drivers: F1DriverStanding[];
  teams: F1TeamStanding[];
}

export interface F1RaceResultRow {
  position: string;
  driverNumber: string;
  driver: string;
  shortName: string;
  team: string;
  laps: string;
  time: string;
  points: number;
}

export interface F1FastestLapRow {
  position: string;
  driverNumber: string;
  driver: string;
  shortName: string;
  team: string;
  lap: string;
  timeOfDay: string;
  time: string;
  averageSpeed: string;
}

export interface F1PitStopRow {
  stop: string;
  driverNumber: string;
  driver: string;
  shortName: string;
  team: string;
  lap: string;
  timeOfDay: string;
  time: string;
  total: string;
}

async function getData<T>(endpoint: string, fallback: T): Promise<T> {
  const response = await client.get<{ success: boolean; data?: T }>(endpoint);
  return response.data ?? fallback;
}

export const getF1Standings = () =>
  getData<F1StandingsResponse>("/api/formula1/standings", {
    source: "local",
    updatedAt: new Date().toISOString(),
    drivers: [],
    teams: [],
  });

export const getF1RaceAnalysis = (raceId: string) =>
  getData<{ raceResults: F1RaceResultRow[]; fastestLaps: F1FastestLapRow[]; pitStops: F1PitStopRow[]; raceNotes: string[] }>(
    `/api/formula1/races/${raceId}/analysis`,
    { raceResults: [], fastestLaps: [], pitStops: [], raceNotes: [] },
  );
