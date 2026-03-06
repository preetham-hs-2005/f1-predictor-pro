import { ObjectId } from "mongodb";
import { getDB } from "../utils/db";

export interface PredictionDocument {
  _id?: ObjectId;
  userId: string;
  raceWeekendId: string;
  type: "sprint" | "race";
  predictedP1: string;
  predictedP2: string;
  predictedP3: string;
  predictedPole: string;
  unexpectedStatement: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Prediction {
  static async create(prediction: Omit<PredictionDocument, "_id" | "createdAt" | "updatedAt">): Promise<PredictionDocument> {
    const db = getDB();
    const collection = db.collection<PredictionDocument>("predictions");

    const now = new Date();
    const result = await collection.insertOne({
      ...prediction,
      createdAt: now,
      updatedAt: now,
    });

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to create prediction");
    }

    return created;
  }

  static async findById(id: string | ObjectId): Promise<PredictionDocument | null> {
    const db = getDB();
    const collection = db.collection<PredictionDocument>("predictions");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    return collection.findOne({ _id: id });
  }

  static async findByUserAndRace(
    userId: string,
    raceWeekendId: string,
    type: "sprint" | "race"
  ): Promise<PredictionDocument | null> {
    const db = getDB();
    const collection = db.collection<PredictionDocument>("predictions");

    return collection.findOne({
      userId,
      raceWeekendId,
      type,
    });
  }

  static async findByUser(userId: string): Promise<PredictionDocument[]> {
    const db = getDB();
    const collection = db.collection<PredictionDocument>("predictions");

    return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  static async update(
    id: string | ObjectId,
    updates: Partial<Omit<PredictionDocument, "_id" | "createdAt">>
  ): Promise<PredictionDocument | null> {
    const db = getDB();
    const collection = db.collection<PredictionDocument>("predictions");

    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  static async delete(
    userId: string,
    raceWeekendId: string,
    type: "sprint" | "race"
  ): Promise<boolean> {
    const db = getDB();
    const collection = db.collection<PredictionDocument>("predictions");

    const result = await collection.deleteOne({
      userId,
      raceWeekendId,
      type,
    });

    return result.deletedCount > 0;
  }

  static formatResponse(prediction: PredictionDocument) {
    return {
      id: prediction._id?.toString(),
      userId: prediction.userId,
      raceWeekendId: prediction.raceWeekendId,
      type: prediction.type,
      predictedP1: prediction.predictedP1,
      predictedP2: prediction.predictedP2,
      predictedP3: prediction.predictedP3,
      predictedPole: prediction.predictedPole,
      unexpectedStatement: prediction.unexpectedStatement,
      createdAt: prediction.createdAt,
      updatedAt: prediction.updatedAt,
    };
  }
}
