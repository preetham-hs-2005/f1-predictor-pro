/**
 * Custom hook for race weekends data
 */

import { useState, useEffect } from "react";
import { getRaceWeekends, getUpcomingRaces, RaceWeekend } from "@/lib/api/weekends";

interface UseRaceWeekendsReturn {
  races: RaceWeekend[] | null;
  upcomingRaces: RaceWeekend[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRaceWeekends(): UseRaceWeekendsReturn {
  const [races, setRaces] = useState<RaceWeekend[] | null>(null);
  const [upcomingRaces, setUpcomingRaces] = useState<RaceWeekend[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allRaces, upcoming] = await Promise.all([
        getRaceWeekends(),
        getUpcomingRaces(),
      ]);
      setRaces(allRaces);
      setUpcomingRaces(upcoming);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch races";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
    // Refetch every 60 seconds
    const interval = setInterval(fetchRaces, 60000);
    return () => clearInterval(interval);
  }, []);

  return { races, upcomingRaces, isLoading, error, refetch: fetchRaces };
}
