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
  static async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const db = getDB();
    const usersCollection = db.collection("users");

    const pipeline = [
      { $match: { hidden: { $ne: true } } },
      {
        $lookup: {
          from: "scores",
          let: { userIdStr: { $toString: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$userIdStr"] } } }
          ],
          as: "userScores"
        }
      },
      {
        $project: {
          _id: 0,
          userId: { $toString: "$_id" },
          name: { $ifNull: ["$username", { $ifNull: ["$name", "Unknown"] }] },
          username: 1,
          email: { $ifNull: ["$email", "unknown@example.com"] },
          totalPoints: {
            $reduce: {
              input: "$userScores",
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.total", 0] }] }
            }
          },
          correctWinners: {
            $size: {
              $filter: {
                input: "$userScores",
                cond: { $gt: [{ $ifNull: ["$$this.p1Points", 0] }, 0] }
              }
            }
          },
          exactPodiums: {
            $size: {
              $filter: {
                input: "$userScores",
                cond: { $gt: [{ $ifNull: ["$$this.podiumBonusPoints", 0] }, 0] }
              }
            }
          },
          unexpectedAwards: {
            $size: {
              $filter: {
                input: "$userScores",
                cond: { $gt: [{ $ifNull: ["$$this.unexpectedPoints", 0] }, 0] }
              }
            }
          },
          predictionsSubmitted: { $size: "$userScores" }
        }
      },
      { $sort: { totalPoints: -1 } }
    ];

    const leaderboardData = await usersCollection.aggregate(pipeline).toArray() as any[];

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
