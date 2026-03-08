import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";

export interface DiscussionDocument {
  _id?: ObjectId;
  title: string;
  content: string;
  userId: string;
  userName: string;
  category: "general" | "technical" | "race-specific" | "predictions" | "off-topic";
  raceWeekendId?: string; // For race-specific discussions
  isPinned: boolean;
  views: number;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Discussion {
  static async create(
    discussion: Omit<DiscussionDocument, "_id" | "createdAt" | "updatedAt" | "views" | "messageCount">
  ): Promise<DiscussionDocument> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

    const now = new Date();
    const result = await collection.insertOne({
      ...discussion,
      views: 0,
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to create discussion");
    }

    return created;
  }

  static async findById(id: string | ObjectId): Promise<DiscussionDocument | null> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    return collection.findOne({ _id: id });
  }

  static async findByCategory(
    category: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<DiscussionDocument[]> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

    return collection
      .find({ category: category as any })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  static async findAll(limit: number = 20, skip: number = 0): Promise<DiscussionDocument[]> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

    return collection
      .find({})
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  static async findByUser(userId: string): Promise<DiscussionDocument[]> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

    return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  static async update(
    id: string | ObjectId,
    updates: Partial<Omit<DiscussionDocument, "_id" | "createdAt">>
  ): Promise<DiscussionDocument | null> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

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

  static async incrementViews(id: string | ObjectId): Promise<void> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    await collection.updateOne({ _id: id }, { $inc: { views: 1 } });
  }

  static async incrementMessageCount(id: string | ObjectId): Promise<void> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    await collection.updateOne({ _id: id }, { $inc: { messageCount: 1 } });
  }

  static async delete(id: string | ObjectId): Promise<boolean> {
    const db = getDB();
    const collection = db.collection<DiscussionDocument>("discussions");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
