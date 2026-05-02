import { getDB } from "./db.js";

const LOCK_BUFFER_MS = 60_000;

export type PredictionType = "race" | "sprint";

interface RaceRecord {
  raceId: string;
  raceName?: string;
  sprintWeekend?: boolean;
  sprintQualifyingStartTime?: string | null;
  qualifyingStartTime?: string | null;
  cancelled?: boolean;
  isLocked?: boolean;
}

export function normalizePredictionType(type: unknown): PredictionType {
  return type === "sprint" ? "sprint" : "race";
}

export function getPredictionLockDate(race: RaceRecord, type: PredictionType = "race"): Date | null {
  const cutoffDate = getPredictionCutoffDate(race, type);

  if (!cutoffDate) return null;
  return new Date(cutoffDate.getTime() - LOCK_BUFFER_MS);
}

export function getPredictionCutoffDate(race: RaceRecord, type: PredictionType = "race"): Date | null {
  const cutoffSource =
    type === "sprint"
      ? race.sprintWeekend
        ? race.sprintQualifyingStartTime
        : null
      : race.qualifyingStartTime;

  if (!cutoffSource) return null;

  const cutoffDate = new Date(cutoffSource);
  return Number.isNaN(cutoffDate.getTime()) ? null : cutoffDate;
}

export function getPredictionTimestamp(prediction: any): Date | null {
  const timestampSource = prediction.updatedAt || prediction.createdAt;
  if (!timestampSource) return null;

  const timestamp = new Date(timestampSource);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

export function isPredictionDisqualified(
  race: RaceRecord,
  prediction: any,
  type: PredictionType = "race"
): boolean {
  const cutoffDate = getPredictionCutoffDate(race, type);
  const predictionTime = getPredictionTimestamp(prediction);

  return !!cutoffDate && !!predictionTime && predictionTime > cutoffDate;
}

export async function getRaceForPrediction(raceWeekendId: string): Promise<RaceRecord | null> {
  const db = getDB();
  return db.collection<RaceRecord>("races").findOne({ raceId: raceWeekendId });
}

export async function assertPredictionWindowOpen(
  raceWeekendId: string,
  type: PredictionType
): Promise<void> {
  const race = await getRaceForPrediction(raceWeekendId);

  if (!race) {
    throw Object.assign(new Error("Race weekend not found"), { statusCode: 404 });
  }

  if (type === "sprint" && !race.sprintWeekend) {
    throw Object.assign(new Error("Sprint predictions are not available for this race"), { statusCode: 400 });
  }

  const lockDate = getPredictionLockDate(race, type);
  const locked = race.cancelled || race.isLocked || !lockDate || new Date() >= lockDate;

  if (locked) {
    throw Object.assign(
      new Error(`Predictions are locked for ${race.raceName || raceWeekendId}`),
      {
        statusCode: 423,
        lockDate: lockDate?.toISOString(),
      }
    );
  }
}

export async function findLockedPredictionKeys(): Promise<string[]> {
  const db = getDB();
  const races = await db.collection<RaceRecord>("races").find({}).toArray();
  const now = new Date();

  return races.flatMap((race) => {
    const keys: string[] = [];

    const raceLockDate = getPredictionLockDate(race, "race");
    if (race.cancelled || race.isLocked || !raceLockDate || now >= raceLockDate) {
      keys.push(`${race.raceId}:race`);
    }

    if (race.sprintWeekend) {
      const sprintLockDate = getPredictionLockDate(race, "sprint");
      if (race.cancelled || race.isLocked || !sprintLockDate || now >= sprintLockDate) {
        keys.push(`${race.raceId}:sprint`);
      }
    }

    return keys;
  });
}
