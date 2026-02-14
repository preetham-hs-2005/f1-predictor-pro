import { MongoClient, Db } from "mongodb";

let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  let mongoUri = process.env.MONGODB_URI;
  
  // Fallback to MongoDB Atlas connection (already tested)
  if (!mongoUri) {
    mongoUri = "mongodb+srv://Pree:pree1234@cluster0.o2h7vze.mongodb.net/f1_prediction_league?retryWrites=true&w=majority";
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  db = client.db("f1_prediction_league");
  
  // Create indexes
  const usersCollection = db.collection("users");
  await usersCollection.createIndex({ email: 1 }, { unique: true });

  console.log("✅ Connected to MongoDB");
  return db;
}

export function getDB(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}
