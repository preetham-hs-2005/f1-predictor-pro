import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";

export interface PollDocument {
  _id?: ObjectId;
  discussionId: string;
  userId: string;
  userName: string;
  question: string;
  description?: string;
  type: "single" | "multiple"; // single choice or multiple choice
  options: string[]; // Array of option texts
  allowMultiple: boolean;
  totalVotes: number;
  closed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Poll {
  static async create(
    poll: Omit<PollDocument, "_id" | "createdAt" | "updatedAt" | "totalVotes">
  ): Promise<PollDocument> {
    const db = getDB();
    const collection = db.collection<PollDocument>("polls");

    const now = new Date();
    const result = await collection.insertOne({
      ...poll,
      totalVotes: 0,
      createdAt: now,
      updatedAt: now,
    });

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to create poll");
    }

    return created;
  }

  static async findById(id: string | ObjectId): Promise<PollDocument | null> {
    const db = getDB();
    const collection = db.collection<PollDocument>("polls");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    return collection.findOne({ _id: id });
  }

  static async findByDiscussion(discussionId: string): Promise<PollDocument[]> {
    const db = getDB();
    const collection = db.collection<PollDocument>("polls");

    return collection.find({ discussionId }).sort({ createdAt: -1 }).toArray();
  }

  static async update(
    id: string | ObjectId,
    updates: Partial<Omit<PollDocument, "_id" | "createdAt">>
  ): Promise<PollDocument | null> {
    const db = getDB();
    const collection = db.collection<PollDocument>("polls");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result || null;
  }

  static async incrementVotes(id: string | ObjectId): Promise<void> {
    const db = getDB();
    const collection = db.collection<PollDocument>("polls");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    await collection.updateOne({ _id: id }, { $inc: { totalVotes: 1 } });
  }

  static async closePoll(id: string | ObjectId): Promise<void> {
    const db = getDB();
    const collection = db.collection<PollDocument>("polls");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    await collection.updateOne({ _id: id }, { $set: { closed: true } });
  }

  static async delete(id: string | ObjectId): Promise<boolean> {
    const db = getDB();
    const collection = db.collection<PollDocument>("polls");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  static async deleteByDiscussion(discussionId: string): Promise<void> {
    const db = getDB();
    const collection = db.collection<PollDocument>("polls");

    await collection.deleteMany({ discussionId });
  }
}
