import { type Prediction } from "@/components/prediction/PredictionForm";

const RESULTS_KEY = "f1_results";
const SCORES_KEY = "f1_scores";
const USERS_KEY = "f1_users";

export interface RaceResult {
  raceId: string;
  type: "sprint" | "race";
  p1: string;
  p2: string;
  p3: string;
  pole: string;
}

export interface ScoreEntry {
  userId: string;
  raceId: string;
  type: "sprint" | "race";
  p1Points: number;
  p2Points: number;
  p3Points: number;
  polePoints: number;
  podiumBonusPoints: number;
  unexpectedPoints: number;
  total: number;
}

// --- Results ---

export const getStoredResults = (): RaceResult[] => {
  try {
    return JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const getResult = (raceId: string, type: "sprint" | "race"): RaceResult | null => {
  return getStoredResults().find((r) => r.raceId === raceId && r.type === type) || null;
};

export const saveResult = (result: RaceResult) => {
  const all = getStoredResults();
  const idx = all.findIndex((r) => r.raceId === result.raceId && r.type === result.type);
  if (idx >= 0) all[idx] = result;
  else all.push(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
};

// --- Scores ---

export const getStoredScores = (): ScoreEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveScores = (scores: ScoreEntry[]) => {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
};

// --- Scoring Logic ---

export const calculateScore = (
  prediction: Prediction,
  result: RaceResult
): Omit<ScoreEntry, "userId" | "raceId" | "type"> => {
  const isSprint = prediction.type === "sprint";
  const m = isSprint ? 0.5 : 1;

  const p1Points = prediction.p1 === result.p1 ? 25 * m : 0;
  const p2Points = prediction.p2 === result.p2 ? 20 * m : 0;
  const p3Points = prediction.p3 === result.p3 ? 15 * m : 0;
  const polePoints = prediction.pole === result.pole ? 10 * m : 0;

  const exactPodium =
    prediction.p1 === result.p1 &&
    prediction.p2 === result.p2 &&
    prediction.p3 === result.p3;
  const podiumBonusPoints = exactPodium ? 20 * m : 0;

  const unexpectedPoints = 0; // admin awards manually

  const total = p1Points + p2Points + p3Points + polePoints + podiumBonusPoints + unexpectedPoints;

  return { p1Points, p2Points, p3Points, polePoints, podiumBonusPoints, unexpectedPoints, total };
};

// Score all predictions for a race result
export const scoreRace = (result: RaceResult) => {
  const PREDICTIONS_KEY = "f1_predictions";
  let predictions: Prediction[] = [];
  try {
    predictions = JSON.parse(localStorage.getItem(PREDICTIONS_KEY) || "[]");
  } catch {
    return;
  }

  const matching = predictions.filter(
    (p) => p.raceId === result.raceId && p.type === result.type
  );

  const existingScores = getStoredScores().filter(
    (s) => !(s.raceId === result.raceId && s.type === result.type)
  );

  const newScores: ScoreEntry[] = matching.map((pred) => {
    const score = calculateScore(pred, result);
    return {
      userId: pred.userId,
      raceId: result.raceId,
      type: result.type,
      ...score,
    };
  });

  saveScores([...existingScores, ...newScores]);
  updateUserTotalPoints();
};

// Award unexpected points for a specific user/race
export const awardUnexpectedPoints = (
  userId: string,
  raceId: string,
  type: "sprint" | "race"
) => {
  const isSprint = type === "sprint";
  const pts = isSprint ? 7.5 : 15;
  const scores = getStoredScores();
  const entry = scores.find(
    (s) => s.userId === userId && s.raceId === raceId && s.type === type
  );
  if (entry) {
    entry.unexpectedPoints = pts;
    entry.total += pts;
    saveScores(scores);
    updateUserTotalPoints();
  }
};

export const removeUnexpectedPoints = (
  userId: string,
  raceId: string,
  type: "sprint" | "race"
) => {
  const scores = getStoredScores();
  const entry = scores.find(
    (s) => s.userId === userId && s.raceId === raceId && s.type === type
  );
  if (entry && entry.unexpectedPoints > 0) {
    entry.total -= entry.unexpectedPoints;
    entry.unexpectedPoints = 0;
    saveScores(scores);
    updateUserTotalPoints();
  }
};

// Recalculate user total points from all scores
const updateUserTotalPoints = () => {
  const scores = getStoredScores();
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    for (const user of users) {
      const userScores = scores.filter((s) => s.userId === user.id);
      user.totalPoints = userScores.reduce((sum: number, s: ScoreEntry) => sum + s.total, 0);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
};

// Get leaderboard data
export const getLeaderboard = () => {
  const scores = getStoredScores();
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return users
      .map((u: any) => {
        const userScores = scores.filter((s) => s.userId === u.id);
        const totalPoints = userScores.reduce((sum: number, s: ScoreEntry) => sum + s.total, 0);
        const correctWinners = userScores.filter((s) => s.p1Points > 0).length;
        const exactPodiums = userScores.filter((s) => s.podiumBonusPoints > 0).length;
        return {
          id: u.id,
          name: u.name,
          totalPoints,
          correctWinners,
          exactPodiums,
        };
      })
      .sort((a: any, b: any) => b.totalPoints - a.totalPoints);
  } catch {
    return [];
  }
};

// Get all predictions for a race
export const getRacePredictions = (raceId: string, type: "sprint" | "race") => {
  const PREDICTIONS_KEY = "f1_predictions";
  try {
    const predictions: Prediction[] = JSON.parse(
      localStorage.getItem(PREDICTIONS_KEY) || "[]"
    );
    return predictions.filter((p) => p.raceId === raceId && p.type === type);
  } catch {
    return [];
  }
};

// Get all users
export const getAllUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      totalPoints: u.totalPoints || 0,
    }));
  } catch {
    return [];
  }
};

// Toggle admin role
export const toggleUserRole = (userId: string) => {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const user = users.find((u: any) => u.id === userId);
    if (user) {
      user.role = user.role === "admin" ? "user" : "admin";
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return user?.role;
  } catch {
    return null;
  }
};
