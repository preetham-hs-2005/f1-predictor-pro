import client from "./client";

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  country_name?: string;
  year?: number;
}

export interface PositionSample {
  date: string;
  driver_number: number;
  position: number;
  gap_to_leader?: string | number | null;
}

export interface LapSample {
  driver_number: number;
  lap_duration?: number | null;
  lap_number?: number;
}

export interface CarDataSample {
  date: string;
  driver_number: number;
  speed?: number | null;
}

async function getData<T>(endpoint: string): Promise<T> {
  const response = await client.get<{ success: boolean; data?: T }>(endpoint);
  return response.data as T;
}

export const getOpenF1Sessions = (year: number, country?: string, type?: string) => {
  const params = new URLSearchParams({ year: String(year) });
  if (country) params.set("country", country);
  if (type) params.set("type", type);
  return getData<OpenF1Session[] | OpenF1Session | null>(`/api/openf1/sessions?${params.toString()}`);
};

export const getOpenF1Positions = (sessionKey: number | string) =>
  getData<PositionSample[]>(`/api/openf1/positions/${sessionKey}`);

export const getOpenF1Laps = (sessionKey: number | string) =>
  getData<LapSample[]>(`/api/openf1/laps/${sessionKey}`);

export const getOpenF1CarData = (sessionKey: number | string, driverNumber: number | string) =>
  getData<CarDataSample[]>(`/api/openf1/car-data/${sessionKey}/${driverNumber}`);

export const getOpenF1RaceControl = (sessionKey: number | string) => getData<any[]>(`/api/openf1/race-control/${sessionKey}`);
export const getOpenF1Stints = (sessionKey: number | string) => getData<any[]>(`/api/openf1/stints/${sessionKey}`);
export const getOpenF1Pit = (sessionKey: number | string) => getData<any[]>(`/api/openf1/pit/${sessionKey}`);
export const getOpenF1TeamRadio = (sessionKey: number | string) => getData<any[]>(`/api/openf1/team-radio/${sessionKey}`);
export const getOpenF1Weather = (sessionKey: number | string) => getData<any[]>(`/api/openf1/weather/${sessionKey}`);
export const getOpenF1Drivers = (sessionKey: number | string) => getData<any[]>(`/api/openf1/drivers/${sessionKey}`);
export const getOpenF1Constructors = (sessionKey: number | string) => getData<any[]>(`/api/openf1/constructors/${sessionKey}`);
