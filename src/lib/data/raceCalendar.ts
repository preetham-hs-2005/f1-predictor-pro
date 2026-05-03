export interface RaceWeekend {
  id: string;
  raceName: string;
  circuitName: string;
  country?: string;
  countryFlag: string;
  round: number;
  sprintQualifyingStartTime?: string | null;
  sprintStartTime?: string | null;
  openF1QualifyingSessionKey?: number | null;
  openF1RaceSessionKey?: number | null;
  openF1SprintQualifyingSessionKey?: number | null;
  qualifyingStartTime: string;
  raceStartTime: string;
  sprintWeekend: boolean;
  timeZone: string;
  isLocked?: boolean;
  isComplete?: boolean;
  cancelled: boolean;
  officialResults?: null | { p1: string; p2: string; p3: string; pole: string };
  sprintResults?: null | { p1: string; p2: string; p3: string; pole: string };
}

const LOCK_BUFFER_MS = 60_000;

export type PredictionType = "race" | "sprint";

export const getPredictionLockSource = (race: RaceWeekend, type: PredictionType = "race") => {
  if (type === "sprint") {
    return race.sprintWeekend ? race.sprintQualifyingStartTime || null : null;
  }

  return race.qualifyingStartTime;
};

export const getPredictionLockTime = (race: RaceWeekend, type: PredictionType = "race") => {
  const lockSource = getPredictionLockSource(race, type);
  if (!lockSource) return null;
  return new Date(new Date(lockSource).getTime() - LOCK_BUFFER_MS);
};

export const isPredictionLocked = (race: RaceWeekend, type: PredictionType = "race") => {
  const lockTime = getPredictionLockTime(race, type);
  return race.cancelled || !!race.isLocked || !lockTime || new Date() >= lockTime;
};

export const isPredictionDisqualified = (
  race: RaceWeekend,
  prediction: { createdAt?: string | Date; updatedAt?: string | Date },
  type: PredictionType = "race",
) => {
  const cutoffSource = getPredictionLockSource(race, type);
  const predictionSource = prediction.updatedAt || prediction.createdAt;

  if (!cutoffSource || !predictionSource) return false;

  const cutoffDate = new Date(cutoffSource);
  const predictionDate = new Date(predictionSource);

  if (Number.isNaN(cutoffDate.getTime()) || Number.isNaN(predictionDate.getTime())) {
    return false;
  }

  return predictionDate > cutoffDate;
};

export const isRaceLocked = (race: RaceWeekend) => isPredictionLocked(race, "race");
export const isSprintLocked = (race: RaceWeekend) => isPredictionLocked(race, "sprint");
