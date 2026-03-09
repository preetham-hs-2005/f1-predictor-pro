import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";

export interface UserDocument {
  _id?: ObjectId;
  name: string;
  username?: string;
  email: string;
  password: string;
  role: "user" | "admin";
  totalPoints: number;
  hidden?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  static async create(name: string, email: string, password: string, username: string): Promise<UserDocument> {
    const db = getDB();
    const collection = db.collection<UserDocument>("users");

    // Check if user already exists
    const existing = await collection.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      if (existing.email === email) throw new Error("User with this email already exists");
      if (existing.username === username) throw new Error("Username is already taken");
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();

    const result = await collection.insertOne({
      name,
      username,
      email,
      password: hashedPassword,
      role: "user",
      totalPoints: 0,
      hidden: false,
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

  static async updateUsername(id: string | ObjectId, username: string): Promise<UserDocument | null> {
    const db = getDB();
    const collection = db.collection<UserDocument>("users");
    
    // Check if username already exists
    const existing = await collection.findOne({ username });
    if (existing) {
      throw new Error("Username is already taken");
    }
    
    if (typeof id === "string") {
      id = new ObjectId(id);
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: { username, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error("User not found");
    }
    
    return result;
  }

  static async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
    return comparePassword(password, user.password);
  }

  static formatResponse(user: UserDocument) {
    return {
      id: user._id?.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      totalPoints: user.totalPoints,
    };
  }
}
