import apiClient from "./client";

export interface Driver {
  _id?: string;
  id: string; // The shorthand like "ver", "ham"
  name: string;
  team: string;
  number: number;
  country: string;
  countryFlag: string;
  teamColor: string;
  isActive: boolean;
}

type DriverUpdate = Partial<Omit<Driver, "_id" | "id">>;

export const driversApi = {
  getAll: async (all: boolean = false) => {
    const response = await apiClient.get<{ success: boolean; data: Driver[] }>(
      `/api/drivers${all ? '?all=true' : ''}`
    );
    return response.data;
  },

  create: async (driver: Omit<Driver, "_id">) => {
    const response = await apiClient.post<{ success: boolean; data: Driver }>(
      "/api/drivers",
      driver
    );
    return response;
  },

  update: async (id: string, updates: Partial<Driver>) => {
    const { _id, id: driverId, ...safeUpdates } = updates;
    const response = await apiClient.patch<{ success: boolean; data: Driver }>(
      `/api/drivers/${id}`,
      safeUpdates as DriverUpdate
    );
    return response;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/drivers/${id}`
    );
    return response;
  },
};
