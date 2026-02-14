/**
 * Custom hook for predictions data
 */

import { useState, useEffect } from "react";
import { getUserPredictions, getUserPrediction, Prediction } from "@/lib/api/predictions";

interface UsePredictionsReturn {
  predictions: Prediction[] | null;
  isLoading: boolean;
  error: string | null;
  getPrediction: (raceId: string) => Promise<Prediction | null>;
  refetch: () => Promise<void>;
}

export function usePredictions(): UsePredictionsReturn {
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserPredictions();
      setPredictions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch predictions";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPrediction = async (raceId: string): Promise<Prediction | null> => {
    try {
      return await getUserPrediction(raceId);
    } catch (err) {
      console.error("Failed to fetch prediction:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchPredictions();
    // Refetch every 60 seconds
    const interval = setInterval(fetchPredictions, 60000);
    return () => clearInterval(interval);
  }, []);

  return { predictions, isLoading, error, getPrediction, refetch: fetchPredictions };
}
