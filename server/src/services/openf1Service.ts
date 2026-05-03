const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const DEFAULT_CACHE_TTL_MS = 8_000;

type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end?: string;
  country_name?: string;
  year?: number;
}

export interface OpenF1Position {
  date: string;
  driver_number: number;
  position: number;
  gap_to_leader?: string | number | null;
}

export interface OpenF1Lap {
  driver_number: number;
  lap_duration?: number | null;
  lap_number?: number;
}

export interface OpenF1CarData {
  date: string;
  driver_number: number;
  speed?: number | null;
}

const cache = new Map<string, CacheEntry<unknown>>();

const COUNTRY_ALIASES: Record<string, string> = {
  australia: "Australia",
  china: "China",
  japan: "Japan",
  bahrain: "Bahrain",
  saudi: "Saudi Arabia",
  miami: "United States",
  canada: "Canada",
  monaco: "Monaco",
  spain: "Spain",
  madrid: "Spain",
  austria: "Austria",
  britain: "Great Britain",
  belgium: "Belgium",
  hungary: "Hungary",
  dutch: "Netherlands",
  netherlands: "Netherlands",
  italy: "Italy",
  azerbaijan: "Azerbaijan",
  singapore: "Singapore",
  usa: "United States",
  "united-states": "United States",
  mexico: "Mexico",
  brazil: "Brazil",
  qatar: "Qatar",
  "abu-dhabi": "United Arab Emirates",
};

export function getOpenF1CountryName(race: {
  country?: string | null;
  raceId?: string | null;
  raceName?: string | null;
}): string | null {
  if (race.country) return race.country;

  const source = `${race.raceId || ""} ${race.raceName || ""}`.toLowerCase();
  const alias = Object.entries(COUNTRY_ALIASES).find(([key]) => source.includes(key));
  return alias?.[1] || null;
}

function buildUrl(path: string, params: Record<string, string | number | undefined | null>) {
  const url = new URL(`${OPENF1_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function getJson<T>(path: string, params: Record<string, string | number | undefined | null> = {}, ttl = DEFAULT_CACHE_TTL_MS): Promise<T> {
  const url = buildUrl(path, params);
  const cached = cache.get(url) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const MAX_RETRIES = 5;
  const INITIAL_DELAY_MS = 1000; // 1 second
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      
      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        if (attempt < MAX_RETRIES) {
          // Calculate delay with exponential backoff and jitter
          const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
          const jitter = Math.random() * 0.1 * delay; // Add up to 10% jitter
          const totalDelay = delay + jitter;
          
          console.log(`[OpenF1] Rate limited. Retrying in ${Math.round(totalDelay)}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, totalDelay));
          continue;
        } else {
          throw new Error(`OpenF1 request failed: 429 Too Many Requests (max retries exceeded)`);
        }
      }
      
      if (!response.ok) {
        throw new Error(`OpenF1 request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as T;
      cache.set(url, { data, expiresAt: Date.now() + ttl });
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If it's not a rate limit error and not a timeout, don't retry
      if (error instanceof Error && !error.message.includes("429")) {
        throw error;
      }
      
      // For other errors, continue to retry
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * delay;
        const totalDelay = delay + jitter;
        console.log(`[OpenF1] Request failed, retrying in ${Math.round(totalDelay)}ms (attempt ${attempt + 1}/${MAX_RETRIES}): ${error}`);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }

  // If we've exhausted retries, throw the last error
  throw lastError || new Error("OpenF1 request failed after maximum retries");
}

export async function getSessions(year?: number, country?: string): Promise<OpenF1Session[]> {
  return getJson<OpenF1Session[]>("/sessions", {
    year,
    country_name: country,
  });
}

export function getSessionByType(sessions: OpenF1Session[], type: string): OpenF1Session | null {
  if (!Array.isArray(sessions) || sessions.length === 0) return null;

  const normalizedType = type.toLowerCase();
  const aliases =
    normalizedType === "sprint qualifying"
      ? ["sprint qualifying", "sprint shootout"]
      : normalizedType === "qualifying"
        ? ["qualifying"]
        : [normalizedType];

  return (
    sessions.find((session) => {
      const name = `${session.session_name || ""} ${session.session_type || ""}`.toLowerCase();
      return aliases.some((alias) => name.includes(alias));
    }) || null
  );
}

export async function getPositions(session_key: number | string) {
  return getJson<OpenF1Position[]>("/position", { session_key }, 5_000);
}

export async function getLaps(session_key: number | string) {
  return getJson<OpenF1Lap[]>("/laps", { session_key }, 8_000);
}

export async function getCarData(session_key: number | string, driver_number: number | string) {
  return getJson<OpenF1CarData[]>("/car_data", { session_key, driver_number }, 8_000);
}

export async function getPredictionSessionForRace(race: {
  country?: string;
  raceId?: string;
  raceName?: string;
  raceStartTime?: string | Date | null;
}, type: "race" | "sprint" = "race"): Promise<OpenF1Session | null> {
  const country = getOpenF1CountryName(race);
  if (!country || !race.raceStartTime) return null;

  const raceDate = new Date(race.raceStartTime);
  if (Number.isNaN(raceDate.getTime())) return null;

  const sessions = await getSessions(raceDate.getUTCFullYear(), country);
  return getSessionByType(sessions, type === "sprint" ? "Sprint Qualifying" : "Qualifying");
}
