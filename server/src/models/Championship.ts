import { getDB } from "../utils/db.js";
import { Driver } from "./Driver.js";

export interface DriverStanding {
  position: number;
  driverId: string;
  driverName: string;
  teamColor: string;
  countryFlag: string;
  points: number;
  wins: number;
  podiums: number;
}

export interface ConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
}

export class Championship {
  static async getDriverStandings(): Promise<DriverStanding[]> {
    const db = getDB();
    const resultsCollection = db.collection("results");
    const drivers = await Driver.getAll(false); // Include inactive

    // Aggregate wins and calculate points
    const standings: Map<string, { wins: number; podiums: number; points: number }> = new Map();

    // Get all race results
    const allResults = await resultsCollection.find({ type: "race" }).toArray();

    for (const result of allResults) {
      // P1: 25 points
      if (result.p1) {
        const current = standings.get(result.p1) || { wins: 0, podiums: 0, points: 0 };
        current.wins += 1;
        current.podiums += 1;
        current.points += 25;
        standings.set(result.p1, current);
      }

      // P2: 18 points
      if (result.p2) {
        const current = standings.get(result.p2) || { wins: 0, podiums: 0, points: 0 };
        current.podiums += 1;
        current.points += 18;
        standings.set(result.p2, current);
      }

      // P3: 15 points
      if (result.p3) {
        const current = standings.get(result.p3) || { wins: 0, podiums: 0, points: 0 };
        current.podiums += 1;
        current.points += 15;
        standings.set(result.p3, current);
      }

      // Fastest lap: 1 point (simplified - assuming included in results)
      // This would need a separate fastestLap field in results
    }

    // Convert to sorted array with driver info
    const driverStandings: DriverStanding[] = Array.from(standings.entries())
      .map(([driverId, stats]) => {
        const driver = drivers.find((d) => d.id === driverId);
        return {
          position: 0, // Will be set after sorting
          driverId,
          driverName: driver?.name || "Unknown",
          teamColor: driver?.teamColor || "#999999",
          countryFlag: driver?.countryFlag || "🏁",
          points: stats.points,
          wins: stats.wins,
          podiums: stats.podiums,
        };
      })
      .sort((a, b) => {
        // Sort by points (descending), then wins (descending)
        if (b.points !== a.points) return b.points - a.points;
        return b.wins - a.wins;
      })
      .map((standing, index) => ({
        ...standing,
        position: index + 1,
      }));

    return driverStandings;
  }

  static async getConstructorStandings(): Promise<ConstructorStanding[]> {
    const db = getDB();
    const resultsCollection = db.collection("results");
    const drivers = await Driver.getAll(false);

    // Aggregate constructor points
    const standings: Map<string, { wins: number; points: number; teamColor: string }> = new Map();

    const allResults = await resultsCollection.find({ type: "race" }).toArray();

    for (const result of allResults) {
      // P1: 25 points
      if (result.p1) {
        const driver = drivers.find((d) => d.id === result.p1);
        if (driver) {
          const current = standings.get(driver.team) || { wins: 0, points: 0, teamColor: driver.teamColor };
          current.wins += 1;
          current.points += 25;
          standings.set(driver.team, current);
        }
      }

      // P2: 18 points
      if (result.p2) {
        const driver = drivers.find((d) => d.id === result.p2);
        if (driver) {
          const current = standings.get(driver.team) || { wins: 0, points: 0, teamColor: driver.teamColor };
          current.points += 18;
          standings.set(driver.team, current);
        }
      }

      // P3: 15 points
      if (result.p3) {
        const driver = drivers.find((d) => d.id === result.p3);
        if (driver) {
          const current = standings.get(driver.team) || { wins: 0, points: 0, teamColor: driver.teamColor };
          current.points += 15;
          standings.set(driver.team, current);
        }
      }
    }

    const constructorStandings: ConstructorStanding[] = Array.from(standings.entries())
      .map(([team, stats]) => ({
        position: 0,
        team,
        teamColor: stats.teamColor,
        points: stats.points,
        wins: stats.wins,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.wins - a.wins;
      })
      .map((standing, index) => ({
        ...standing,
        position: index + 1,
      }));

    return constructorStandings;
  }
}
