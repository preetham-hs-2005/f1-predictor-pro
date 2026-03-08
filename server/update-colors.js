import "dotenv/config";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not set in .env.local");
  process.exit(1);
}

const teamsToUpdate = [
  { team: "McLaren", teamColor: "#FF8000" },
  { team: "Mercedes", teamColor: "#C0C0C0" },
  { team: "Ferrari", teamColor: "#FF0000" },
  { team: "Red Bull Racing", teamColor: "#00008B" },
  { team: "Aston Martin", teamColor: "#004225" },
  { team: "Alpine", teamColor: "#FFC0CB" },
  { team: "Williams", teamColor: "#4169E1" },
  { team: "Haas", teamColor: "#FFFFFF" },
  { team: "Racing Bulls", teamColor: "#000080" },
  { team: "Audi", teamColor: "#000000" },
  { team: "Cadillac", teamColor: "#7DF9FF" },
];

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    for (const t of teamsToUpdate) {
      const result = await db.collection("drivers").updateMany(
        { team: t.team },
        { $set: { teamColor: t.teamColor } }
      );
      console.log(`Updated ${result.modifiedCount} drivers for team ${t.team} with color ${t.teamColor}`);
    }
    
    console.log("Color update complete.");
  } catch (error) {
    console.error("Error updating colors:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run();
