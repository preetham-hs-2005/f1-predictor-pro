import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";

export interface PollVoteDocument {
  _id?: ObjectId;
  pollId: string;
  userId: string;
  selectedOptions: number[]; // Index(es) of selected options
  createdAt: Date;
}

export class PollVote {
  static async create(
    vote: Omit<PollVoteDocument, "_id" | "createdAt">
  ): Promise<PollVoteDocument> {
    const db = getDB();
    const collection = db.collection<PollVoteDocument>("pollVotes");

    const now = new Date();
    const result = await collection.insertOne({
      ...vote,
      createdAt: now,
    });

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to create poll vote");
    }

    return created;
  }

  static async findByPollAndUser(
    pollId: string,
    userId: string
  ): Promise<PollVoteDocument | null> {
    const db = getDB();
    const collection = db.collection<PollVoteDocument>("pollVotes");

    return collection.findOne({ pollId, userId });
  }

  static async findByPoll(pollId: string): Promise<PollVoteDocument[]> {
    const db = getDB();
    const collection = db.collection<PollVoteDocument>("pollVotes");

    return collection.find({ pollId }).toArray();
  }

  static async getVoteCounts(pollId: string, optionCount: number): Promise<number[]> {
    const db = getDB();
    const collection = db.collection<PollVoteDocument>("pollVotes");

    // Initialize counts for all options
    const counts = new Array(optionCount).fill(0);

    // Get all votes for this poll
    const votes = await collection.find({ pollId }).toArray();

    // Count votes for each option
    votes.forEach((vote) => {
      vote.selectedOptions.forEach((optionIndex) => {
        if (optionIndex < optionCount) {
          counts[optionIndex]++;
        }
      });
    });

    return counts;
  }

  static async delete(id: string | ObjectId): Promise<boolean> {
    const db = getDB();
    const collection = db.collection<PollVoteDocument>("pollVotes");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  static async deleteByPoll(pollId: string): Promise<void> {
    const db = getDB();
    const collection = db.collection<PollVoteDocument>("pollVotes");

    await collection.deleteMany({ pollId });
  }
}
