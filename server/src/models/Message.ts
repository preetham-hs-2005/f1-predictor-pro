import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";

export interface MessageDocument {
  _id?: ObjectId;
  discussionId: string;
  userId: string;
  userName: string;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Message {
  static async create(
    message: Omit<MessageDocument, "_id" | "createdAt" | "updatedAt" | "likes">
  ): Promise<MessageDocument> {
    const db = getDB();
    const collection = db.collection<MessageDocument>("messages");

    const now = new Date();
    const result = await collection.insertOne({
      ...message,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    });

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to create message");
    }

    return created;
  }

  static async findById(id: string | ObjectId): Promise<MessageDocument | null> {
    const db = getDB();
    const collection = db.collection<MessageDocument>("messages");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    return collection.findOne({ _id: id });
  }

  static async findByDiscussion(
    discussionId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<MessageDocument[]> {
    const db = getDB();
    const collection = db.collection<MessageDocument>("messages");

    return collection
      .find({ discussionId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  static async findByUser(userId: string): Promise<MessageDocument[]> {
    const db = getDB();
    const collection = db.collection<MessageDocument>("messages");

    return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  static async update(
    id: string | ObjectId,
    content: string
  ): Promise<MessageDocument | null> {
    const db = getDB();
    const collection = db.collection<MessageDocument>("messages");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: { content, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result || null;
  }

  static async likesIncrement(id: string | ObjectId): Promise<void> {
    const db = getDB();
    const collection = db.collection<MessageDocument>("messages");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    await collection.updateOne({ _id: id }, { $inc: { likes: 1 } });
  }

  static async delete(id: string | ObjectId): Promise<boolean> {
    const db = getDB();
    const collection = db.collection<MessageDocument>("messages");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  static async deleteByDiscussion(discussionId: string): Promise<void> {
    const db = getDB();
    const collection = db.collection<MessageDocument>("messages");

    await collection.deleteMany({ discussionId });
  }
}
