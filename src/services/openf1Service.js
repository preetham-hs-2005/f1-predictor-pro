const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const CACHE_TTL_MS = 8_000;

const cache = new Map();

function buildUrl(path, params = {}) {
  const url = new URL(`${OPENF1_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function request(path, params = {}, ttl = CACHE_TTL_MS) {
  const url = buildUrl(path, params);
  const cached = cache.get(url);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenF1 request failed: ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, { data, expiresAt: Date.now() + ttl });
  return data;
}

export function getSessions(year, country) {
  return request("/sessions", { year, country_name: country });
}

export function getSessionByType(sessions, type) {
  if (!Array.isArray(sessions) || sessions.length === 0) return null;

  const normalizedType = type.toLowerCase();
  const aliases =
    normalizedType === "sprint qualifying"
      ? ["sprint qualifying", "sprint shootout"]
      : [normalizedType];

  return (
    sessions.find((session) => {
      const name = `${session.session_name || ""} ${session.session_type || ""}`.toLowerCase();
      return aliases.some((alias) => name.includes(alias));
    }) || null
  );
}

export function getPositions(session_key) {
  return request("/position", { session_key }, 5_000);
}

export function getLaps(session_key) {
  return request("/laps", { session_key });
}

export function getCarData(session_key, driver_number) {
  return request("/car_data", { session_key, driver_number });
}

