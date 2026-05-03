import { getDB } from "./db.js";
import { getPredictionSessionForRace } from "../services/openf1Service.js";
import { isPredictionLocked as isOpenF1PredictionLocked } from "./timeUtils.js";

const LOCK_BUFFER_MS = 60_000;

export type PredictionType = "race" | "sprint";

interface RaceRecord {
  raceId: string;
  raceName?: string;
  country?: string;
  sprintWeekend?: boolean;
  sprintQualifyingStartTime?: string | null;
  qualifyingStartTime?: string | null;
  raceStartTime?: string | null;
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

async function getOpenF1PredictionSessionStart(
  race: RaceRecord,
  type: PredictionType
): Promise<string | null> {
  try {
    const session = await getPredictionSessionForRace(race, type);
    return session?.date_start || null;
  } catch (error) {
    console.warn(
      `OpenF1 session lookup failed for ${race.raceName || race.raceId}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function isRacePredictionLocked(race: RaceRecord, type: PredictionType): Promise<{ locked: boolean; lockDate: Date | null }> {
  const openF1SessionStart = await getOpenF1PredictionSessionStart(race, type);

  if (openF1SessionStart) {
    const lockDate = new Date(openF1SessionStart);
    return {
      locked: isOpenF1PredictionLocked(openF1SessionStart),
      lockDate: Number.isNaN(lockDate.getTime()) ? null : lockDate,
    };
  }

  const lockDate = getPredictionLockDate(race, type);
  return {
    locked: !lockDate || new Date() >= lockDate,
    lockDate,
  };
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

  const { locked: timeLocked, lockDate } = await isRacePredictionLocked(race, type);
  const locked = race.cancelled || race.isLocked || timeLocked;

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

  const keysByRace = await Promise.all(races.map(async (race) => {
    const keys: string[] = [];

    const raceLock = await isRacePredictionLocked(race, "race");
    if (race.cancelled || race.isLocked || raceLock.locked) {
      keys.push(`${race.raceId}:race`);
    }

    if (race.sprintWeekend) {
      const sprintLock = await isRacePredictionLocked(race, "sprint");
      if (race.cancelled || race.isLocked || sprintLock.locked) {
        keys.push(`${race.raceId}:sprint`);
      }
    }

    return keys;
  }));

  return keysByRace.flat();
}
