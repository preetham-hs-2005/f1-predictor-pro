/**
 * Predictions API - All prediction-related API calls
 */

import { apiClient, ApiResponse } from "./client";

export interface CalculatedPoints {
  p1Points: number;
  p2Points: number;
  p3Points: number;
  polePoints: number;
  exactPodiumBonus: number;
  unexpectedPoints: number;
  baseTotal: number;
  sprintMultiplier: number;
  finalTotal: number;
}

export interface Prediction {
  id: string;
  userId: string;
  raceWeekendId: string;
  predictedP1: string;
  predictedP2: string;
  predictedP3: string;
  predictedPole: string;
  unexpectedStatement: string;
  unexpectedAwarded: boolean;
  calculatedPoints: CalculatedPoints | null;
  submittedAt: Date;
  updatedAt: Date;
}

export interface SubmitPredictionRequest {
  raceWeekendId: string;
  predictedP1: string;
  predictedP2: string;
  predictedP3: string;
  predictedPole: string;
  unexpectedStatement: string;
}

export interface PredictionResponse extends ApiResponse<Prediction> {
  data?: Prediction;
}

/**
 * Submit a new prediction
 */
export async function submitPrediction(
  data: SubmitPredictionRequest
): Promise<Prediction> {
  const response = await apiClient.post<PredictionResponse>(
    "/api/predictions/submit",
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to submit prediction");
  }

  return response.data;
}

/**
 * Get user's prediction for a specific race
 */
export async function getUserPrediction(raceId: string): Promise<Prediction> {
  const response = await apiClient.get<PredictionResponse>(
    `/api/predictions/${raceId}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch prediction");
  }

  return response.data;
}

/**
 * Get all predictions for current user
 */
export async function getUserPredictions(): Promise<Prediction[]> {
  const response = await apiClient.get<ApiResponse<Prediction[]>>(
    "/api/predictions/user"
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch predictions");
  }

  return response.data;
}

/**
 * Update a prediction
 */
export async function updatePrediction(
  raceId: string,
  data: Partial<SubmitPredictionRequest>
): Promise<Prediction> {
  const response = await apiClient.put<PredictionResponse>(
    `/api/predictions/${raceId}`,
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to update prediction");
  }

  return response.data;
}

/**
 * Delete a prediction
 */
export async function deletePrediction(raceId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/api/predictions/${raceId}`
  );

  if (!response.success) {
    throw new Error(response.error || "Failed to delete prediction");
  }
}
