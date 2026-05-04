const F1_BASE_URL = "https://www.formula1.com";
const CACHE_TTL_MS = 5 * 60_000;

type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

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

const cache = new Map<string, CacheEntry<unknown>>();

const RACE_RESULT_PATHS: Record<string, string> = {
  "australia-2026": "/en/results/2026/races/1279/australia",
  "china-2026": "/en/results/2026/races/1280/china",
  "japan-2026": "/en/results/2026/races/1281/japan",
  "miami-2026": "/en/results/2026/races/1284/miami",
  "canada-2026": "/en/results/2026/races/1285/canada",
  "monaco-2026": "/en/results/2026/races/1286/monaco",
  "spain-2026": "/en/results/2026/races/1287/barcelona-catalunya",
  "austria-2026": "/en/results/2026/races/1288/austria",
  "britain-2026": "/en/results/2026/races/1289/great-britain",
  "belgium-2026": "/en/results/2026/races/1290/belgium",
  "hungary-2026": "/en/results/2026/races/1291/hungary",
  "dutch-2026": "/en/results/2026/races/1292/netherlands",
  "italy-2026": "/en/results/2026/races/1293/italy",
  "madrid-2026": "/en/results/2026/races/1294/spain",
  "azerbaijan-2026": "/en/results/2026/races/1295/azerbaijan",
  "singapore-2026": "/en/results/2026/races/1296/singapore",
  "usa-2026": "/en/results/2026/races/1297/united-states",
  "mexico-2026": "/en/results/2026/races/1298/mexico",
  "brazil-2026": "/en/results/2026/races/1299/brazil",
  "vegas-2026": "/en/results/2026/races/1300/las-vegas",
  "qatar-2026": "/en/results/2026/races/1301/qatar",
  "abudhabi-2026": "/en/results/2026/races/1302/abu-dhabi",
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;|\u00a0/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function toText(html: string) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDriverCell(value: string) {
  const shortName = value.match(/[A-Z]{3}$/)?.[0] || "";
  const driver = shortName ? value.slice(0, -3).trim() : value.trim();
  return { driver, shortName };
}

async function getCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const data = await loader();
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

async function fetchPage(path: string) {
  const response = await fetch(`${F1_BASE_URL}${path}`, {
    headers: {
      "accept": "text/html",
      "user-agent": "Mozilla/5.0 F1PredictorPro/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Formula1.com request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseTable(html: string) {
  const table = html.match(/<div id="results-table"[\s\S]*?<\/table>/i)?.[0] || "";
  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].slice(1);

  return rows
    .map((row) => [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => toText(cell[1])))
    .filter((cells) => cells.length > 0 && !cells.join(" ").toLowerCase().includes("no results available"));
}

export async function getF1Standings() {
  return getCached("f1-standings-2026", async () => {
    const [driversHtml, teamsHtml] = await Promise.all([
      fetchPage("/en/results/2026/drivers"),
      fetchPage("/en/results/2026/team"),
    ]);

    const drivers: F1DriverStanding[] = parseTable(driversHtml).map(([position, driverCell, nationality, team, points]) => {
      const driver = parseDriverCell(driverCell);
      return {
        position,
        ...driver,
        nationality,
        team,
        points: Number(points) || 0,
      };
    });

    const teams: F1TeamStanding[] = parseTable(teamsHtml).map(([position, team, points]) => ({
      position,
      team,
      points: Number(points) || 0,
    }));

    return {
      source: "Formula1.com",
      updatedAt: new Date().toISOString(),
      drivers,
      teams,
    };
  });
}

export async function getF1RaceAnalysisFallback(raceId: string) {
  const path = RACE_RESULT_PATHS[raceId];
  if (!path) return { raceResults: [], fastestLaps: [] };

  return getCached(`f1-race-${raceId}`, async () => {
    const [raceHtml, fastestLapsHtml, pitStopsHtml] = await Promise.all([
      fetchPage(`${path}/race-result`),
      fetchPage(`${path}/fastest-laps`),
      fetchPage(`${path}/pit-stop-summary`),
    ]);

    const raceResults: F1RaceResultRow[] = parseTable(raceHtml).map(
      ([position, driverNumber, driverCell, team, laps, time, points]) => {
        const driver = parseDriverCell(driverCell);
        return {
          position,
          driverNumber,
          ...driver,
          team,
          laps,
          time,
          points: Number(points) || 0,
        };
      },
    );

    const fastestLaps: F1FastestLapRow[] = parseTable(fastestLapsHtml).map(
      ([position, driverNumber, driverCell, team, lap, timeOfDay, time, averageSpeed]) => {
        const driver = parseDriverCell(driverCell);
        return {
          position,
          driverNumber,
          ...driver,
          team,
          lap,
          timeOfDay,
          time,
          averageSpeed,
        };
      },
    );

    const pitStops: F1PitStopRow[] = parseTable(pitStopsHtml).map(
      ([stop, driverNumber, driverCell, team, lap, timeOfDay, time, total]) => {
        const driver = parseDriverCell(driverCell);
        return {
          stop,
          driverNumber,
          ...driver,
          team,
          lap,
          timeOfDay,
          time,
          total,
        };
      },
    );

    const raceNotes = toText(
      raceHtml.match(/Note - [\s\S]*?(?=<\/div>|<h2|## OUR PARTNERS|<footer)/i)?.[0] || "",
    )
      .replace(/^Note -\s*/i, "")
      .split(/\.\s+/)
      .map((note) => note.trim())
      .filter(Boolean)
      .map((note) => (note.endsWith(".") ? note : `${note}.`));

    return { raceResults, fastestLaps, pitStops, raceNotes };
  });
}
