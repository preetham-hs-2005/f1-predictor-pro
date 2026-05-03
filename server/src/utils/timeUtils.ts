export function isPredictionLocked(sessionStartUTC: string | Date): boolean {
  return new Date() >= new Date(sessionStartUTC);
}

