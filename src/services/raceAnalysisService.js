/**
 * Race Analysis Service
 * Transforms raw OpenF1 API data into UI-ready insights
 */

/**
 * Get the race session from a list of sessions
 * Filters for session_name === "Race"
 */
export function getRaceSession(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return null;
  return sessions.find((session) => session.session_name === "Race") || null;
}

/**
 * Get the latest position samples for each driver
 * Returns sorted array by position
 */
export function getLatestPositions(positions) {
  if (!Array.isArray(positions) || positions.length === 0) return [];

  const byDriver = new Map();

  positions.forEach((sample) => {
    const current = byDriver.get(sample.driver_number);
    if (!current || new Date(sample.date) > new Date(current.date)) {
      byDriver.set(sample.driver_number, sample);
    }
  });

  return Array.from(byDriver.values()).sort((a, b) => Number(a.position) - Number(b.position));
}

/**
 * Get top N fastest laps
 * Filters out invalid lap times and sorts by lap duration
 */
export function getTopFastestLaps(laps, topN = 5) {
  if (!Array.isArray(laps) || laps.length === 0) return [];

  return laps
    .filter((lap) => Number.isFinite(Number(lap.lap_duration)) && Number(lap.lap_duration) > 0)
    .sort((a, b) => Number(a.lap_duration) - Number(b.lap_duration))
    .slice(0, topN);
}

/**
 * Calculate average lap time for a specific driver
 * Returns average in seconds or null if no valid laps
 */
export function getDriverAveragePace(laps, driverNumber) {
  if (!Array.isArray(laps) || laps.length === 0) return null;

  const driverLaps = laps.filter(
    (lap) =>
      lap.driver_number === driverNumber &&
      Number.isFinite(Number(lap.lap_duration)) &&
      Number(lap.lap_duration) > 0,
  );

  if (driverLaps.length === 0) return null;

  const totalDuration = driverLaps.reduce((sum, lap) => sum + Number(lap.lap_duration), 0);
  return totalDuration / driverLaps.length;
}

/**
 * Calculate average lap times for all drivers
 * Returns array of {driverNumber, averagePace}
 */
export function getPaceComparison(laps) {
  if (!Array.isArray(laps) || laps.length === 0) return [];

  const driverLaps = new Map();

  laps.forEach((lap) => {
    if (Number.isFinite(Number(lap.lap_duration)) && Number(lap.lap_duration) > 0) {
      if (!driverLaps.has(lap.driver_number)) {
        driverLaps.set(lap.driver_number, []);
      }
      driverLaps.get(lap.driver_number).push(lap);
    }
  });

  const comparison = [];

  driverLaps.forEach((driverLapList, driverNumber) => {
    const totalDuration = driverLapList.reduce((sum, lap) => sum + Number(lap.lap_duration), 0);
    const averagePace = totalDuration / driverLapList.length;
    comparison.push({
      driverNumber,
      averagePace,
      lapCount: driverLapList.length,
    });
  });

  return comparison.sort((a, b) => a.averagePace - b.averagePace);
}

/**
 * Downsample telemetry data to improve performance
 * Keeps every Nth sample based on data length
 */
export function downsampleTelemetry(data, targetPoints = 300) {
  if (!Array.isArray(data) || data.length === 0) return [];

  if (data.length <= targetPoints) {
    return data;
  }

  const samplingRate = Math.ceil(data.length / targetPoints);
  return data.filter((_, index) => index % samplingRate === 0);
}

/**
 * Format lap time in MM:SS.mmm format
 */
export function formatLapTime(seconds) {
  if (!Number.isFinite(seconds)) return "-";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds - minutes * 60;
  return `${minutes}:${remaining.toFixed(3).padStart(6, "0")}`;
}

/**
 * Format speed in km/h
 */
export function formatSpeed(speed) {
  if (!Number.isFinite(speed)) return "-";
  return `${Math.round(speed)} km/h`;
}

/**
 * Get gap to leader in readable format
 */
export function formatGapToLeader(gap) {
  if (gap === null || gap === undefined || gap === "-") return "-";
  const numGap = Number(gap);
  if (!Number.isFinite(numGap)) return "-";
  return numGap === 0 ? "Leader" : `+${numGap.toFixed(3)}s`;
}
