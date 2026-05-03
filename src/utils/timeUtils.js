export function isPredictionLocked(sessionStartUTC) {
  return new Date() >= new Date(sessionStartUTC);
}

