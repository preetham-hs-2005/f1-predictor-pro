import { ObjectId } from "mongodb";
import { getDB } from "../utils/db";
import { hashPassword, comparePassword } from "../utils/password";

export interface UserDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  static async create(name: string, email: string, password: string): Promise<UserDocument> {
    const db = getDB();
    const collection = db.collection<UserDocument>("users");

    // Check if user already exists
    const existing = await collection.findOne({ email });
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();

    const result = await collection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
      totalPoints: 0,
      createdAt: now,
      updatedAt: now,
    });

    const user = await collection.findOne({ _id: result.insertedId });
    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  static async findByEmail(email: string): Promise<UserDocument | null> {
    const db = getDB();
    const collection = db.collection<UserDocument>("users");
    return collection.findOne({ email });
  }

  static async findById(id: string | ObjectId): Promise<UserDocument | null> {
    const db = getDB();
    const collection = db.collection<UserDocument>("users");
    
    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    return collection.findOne({ _id: id });
  }

  static async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
    return comparePassword(password, user.password);
  }

  static formatResponse(user: UserDocument) {
    return {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      totalPoints: user.totalPoints,
    };
  }
}
