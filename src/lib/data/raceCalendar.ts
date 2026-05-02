export interface RaceWeekend {
  id: string;
  raceName: string;
  circuitName: string;
  country?: string;
  countryFlag: string;
  round: number;
  sprintQualifyingStartTime?: string | null;
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

export const isRaceLocked = (race: RaceWeekend) => isPredictionLocked(race, "race");
export const isSprintLocked = (race: RaceWeekend) => isPredictionLocked(race, "sprint");
