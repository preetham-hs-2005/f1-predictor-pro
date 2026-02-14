import { ObjectId } from "mongodb";
import { getDB } from "../utils/db";

export interface RaceResult {
  _id?: ObjectId;
  raceWeekendId: string;
  type: "sprint" | "race";
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Results {
  static async create(result: Omit<RaceResult, "_id" | "createdAt" | "updatedAt">): Promise<RaceResult> {
    const db = getDB();
    const collection = db.collection<RaceResult>("results");

    const now = new Date();
    const existing = await collection.findOne({
      raceWeekendId: result.raceWeekendId,
      type: result.type,
    });

    if (existing) {
      const updated = await collection.findOneAndUpdate(
        { raceWeekendId: result.raceWeekendId, type: result.type },
        {
          $set: {
            ...result,
            updatedAt: now,
          },
        },
        { returnDocument: "after" }
      );
      return updated.value as RaceResult;
    }

    const insertResult = await collection.insertOne({
      ...result,
      createdAt: now,
      updatedAt: now,
    });

    const created = await collection.findOne({ _id: insertResult.insertedId });
    if (!created) {
      throw new Error("Failed to create race result");
    }

    return created;
  }

  static async findByRaceAndType(
    raceWeekendId: string,
    type: "sprint" | "race"
  ): Promise<RaceResult | null> {
    const db = getDB();
    const collection = db.collection<RaceResult>("results");

    return collection.findOne({
      raceWeekendId,
      type,
    });
  }

  static async findByRace(raceWeekendId: string): Promise<RaceResult[]> {
    const db = getDB();
    const collection = db.collection<RaceResult>("results");

    return collection.find({ raceWeekendId }).toArray();
  }

  static async getAll(): Promise<RaceResult[]> {
    const db = getDB();
    const collection = db.collection<RaceResult>("results");

    return collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  static formatResponse(result: RaceResult) {
    return {
      id: result._id?.toString(),
      raceWeekendId: result.raceWeekendId,
      type: result.type,
      p1: result.p1,
      p2: result.p2,
      p3: result.p3,
      pole: result.pole,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}
