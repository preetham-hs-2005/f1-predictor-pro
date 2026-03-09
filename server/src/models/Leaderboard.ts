import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";
import { User } from "./User.js";
import { Prediction } from "./Prediction.js";
import { Results } from "./Results.js";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username?: string;
  email: string;
  totalPoints: number;
  correctWinners: number;
  exactPodiums: number;
  unexpectedAwards: number;
  predictionsSubmitted: number;
}

export class Leaderboard {
  /**
   * Calculate points for a user's prediction vs actual race result
   */
  private static calculatePredictionScore(
    prediction: any,
    result: any | null
  ): { points: number; correctWinner: boolean; exactPodium: boolean; unexpectedAward: boolean, correctConstructor: boolean } {
    let points = 0;
    let correctWinner = false;
    let exactPodium = false;
    let unexpectedAward = false;
    let correctConstructor = false;

    if (!result) {
      // No result yet, no points gained
      return { points, correctWinner, exactPodium, unexpectedAward, correctConstructor };
    }

    // Correct P1 prediction: 25 points
    if (prediction.predictedP1 === result.p1) {
      points += 25;
      correctWinner = true;
    }

    // Correct P2 prediction: 18 points
    if (prediction.predictedP2 === result.p2) {
      points += 18;
    }

    // Correct P3 prediction: 15 points
    if (prediction.predictedP3 === result.p3) {
      points += 15;
    }

    // Correct Pole prediction: 5 points
    if (prediction.predictedPole === result.pole) {
      points += 5;
    }

    // Exact podium (all three correct): 10 bonus points
    if (
      prediction.predictedP1 === result.p1 &&
      prediction.predictedP2 === result.p2 &&
      prediction.predictedP3 === result.p3
    ) {
      points += 10;
      exactPodium = true;
    }

    // Unexpected statement bonus: 3 points
    if (prediction.unexpectedStatement && prediction.unexpectedStatement.trim()) {
      points += 3;
      unexpectedAward = true;
    }

    // Constructor prediction bonus: 10 points
    if (prediction.predictedConstructor && result.bestConstructor && prediction.predictedConstructor === result.bestConstructor) {
      points += 10;
      correctConstructor = true;
    }

    return { points, correctWinner, exactPodium, unexpectedAward, correctConstructor };
  }

  /**
   * Get full leaderboard standings
   */
  static async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const db = getDB();
    const usersCollection = db.collection("users");
    const scoresCollection = db.collection("scores");

    // Get all visible users (not hidden)
    const users = await usersCollection.find({ hidden: { $ne: true } }).toArray();
    console.log(`[LEADERBOARD] Found ${users.length} visible users`);

    // Get scores from persisted scores collection
    const leaderboardData = await Promise.all(
      users.map(async (user: any) => {
        const userId = user._id.toString();
        console.log(`[LEADERBOARD] DEBUG: Querying scores with userId type: ${typeof userId}, value: "${userId}"`);
        
        // Get all scores for this user from the persisted scores collection
        const userScores = await scoresCollection
          .find({ userId })
          .toArray();

        console.log(`[LEADERBOARD] User ${user.name} (${userId}): found ${userScores.length} score entries`);

        let totalPoints = 0;
        let correctWinners = 0;
        let exactPodiums = 0;
        let unexpectedAwards = 0;

        // Sum up all the persisted scores
        for (const score of userScores) {
          totalPoints += score.total || 0;
          if (score.p1Points && score.p1Points > 0) correctWinners++;
          if (score.podiumBonusPoints && score.podiumBonusPoints > 0) exactPodiums++;
          if (score.unexpectedPoints && score.unexpectedPoints > 0) unexpectedAwards++;
        }

        console.log(`[LEADERBOARD] User ${user.name}: totalPoints=${totalPoints}`);

        return {
          userId: userId,
          name: user.username || user.name || "Unknown",
          username: user.username,
          email: user.email || "unknown@example.com",
          totalPoints,
          correctWinners,
          exactPodiums,
          unexpectedAwards,
          predictionsSubmitted: userScores.length,
        };
      })
    );

    // Sort by total points descending
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add rank and limit
    return leaderboardData
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))
      .slice(0, limit);
  }

  /**
   * Get specific user's leaderboard position
   */
  static async getUserPosition(userId: string): Promise<LeaderboardEntry> {
    const leaderboard = await this.getLeaderboard(1000);
    const position = leaderboard.find((entry) => entry.userId === userId);

    if (!position) {
      // User not on leaderboard yet, return zero stats
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      return {
        rank: leaderboard.length + 1,
        userId: userId,
        name: user.username || user.name || "Unknown",
        username: user.username,
        email: user.email || "unknown@example.com",
        totalPoints: 0,
        correctWinners: 0,
        exactPodiums: 0,
        unexpectedAwards: 0,
        predictionsSubmitted: 0,
      };
    }

    return position;
  }
}
