import { f1Drivers } from "./f1Grid";

export interface Driver {
  id: string;
  name: string;
  team: string;
  number: number;
  country: string;
  countryFlag: string;
  teamColor: string;
}

export const drivers: Driver[] = f1Drivers.map((driver) => ({
  id: driver.id,
  name: driver.name,
  team: driver.team,
  number: driver.number,
  country: driver.country,
  countryFlag: driver.countryCode,
  teamColor: driver.teamColor,
}));

export const getDriverById = (id: string) => drivers.find((d) => d.id === id);
export const getDriverByName = (name: string) => drivers.find((d) => d.name === name);
