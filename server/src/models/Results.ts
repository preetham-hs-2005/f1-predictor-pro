import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";

export interface RaceResult {
  _id?: ObjectId;
  raceId?: string;
  raceWeekendId?: string;
  type: "sprint" | "race";
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  bestConstructor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Results {
  static async create(result: Omit<RaceResult, "_id" | "createdAt" | "updatedAt">): Promise<RaceResult> {
    const db = getDB();
    const collection = db.collection<RaceResult>("results");

    const now = new Date();
    const raceId = result.raceId || result.raceWeekendId;
    const existing = await collection.findOne({
      $or: [{ raceWeekendId: raceId }, { raceId: raceId }],
      type: result.type,
    });

    if (existing) {
      const updated = await collection.findOneAndUpdate(
        { $or: [{ raceWeekendId: raceId }, { raceId: raceId }], type: result.type },
        {
          $set: {
            ...result,
            raceId: raceId,
            updatedAt: now,
          },
        },
        { returnDocument: "after" }
      );
      if (!updated) {
        throw new Error("Failed to update race result");
      }
      return updated as unknown as RaceResult;
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
      $or: [{ raceWeekendId }, { raceId: raceWeekendId }],
      type,
    });
  }

  static async findByRace(raceWeekendId: string): Promise<RaceResult[]> {
    const db = getDB();
    const collection = db.collection<RaceResult>("results");

    return collection.find({ $or: [{ raceWeekendId }, { raceId: raceWeekendId }] }).toArray();
  }

  static async getAll(): Promise<RaceResult[]> {
    const db = getDB();
    const collection = db.collection<RaceResult>("results");

    return collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  static formatResponse(result: any) {
    return {
      id: result._id?.toString(),
      raceId: result.raceId || result.raceWeekendId,
      type: result.type,
      p1: result.p1,
      p2: result.p2,
      p3: result.p3,
      pole: result.pole,
      bestConstructor: result.bestConstructor,
      isOfficial: true,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}
