import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";

export interface DriverDocument {
  _id?: ObjectId;
  id: string; // The shorthand like "ver", "ham"
  name: string;
  team: string;
  number: number;
  country: string;
  countryFlag: string;
  teamColor: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Driver {
  static async getAll(activeOnly: boolean = true): Promise<DriverDocument[]> {
    const db = getDB();
    const collection = db.collection<DriverDocument>("drivers");
    
    const query = activeOnly ? { isActive: true } : {};
    return collection.find(query).sort({ team: 1, name: 1 }).toArray();
  }

  static async findById(id: string): Promise<DriverDocument | null> {
    const db = getDB();
    const collection = db.collection<DriverDocument>("drivers");
    
    return collection.findOne({ id });
  }

  static async create(driver: Omit<DriverDocument, "_id" | "createdAt" | "updatedAt">): Promise<DriverDocument> {
    const db = getDB();
    const collection = db.collection<DriverDocument>("drivers");

    const existing = await collection.findOne({ id: driver.id });
    if (existing) {
      throw new Error(`Driver with ID ${driver.id} already exists`);
    }

    const now = new Date();
    const result = await collection.insertOne({
      ...driver,
      createdAt: now,
      updatedAt: now,
    });

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) throw new Error("Failed to create driver");
    
    return created;
  }

  static async update(
    id: string,
    updates: Partial<Omit<DriverDocument, "_id" | "id" | "createdAt">>
  ): Promise<DriverDocument | null> {
    const db = getDB();
    const collection = db.collection<DriverDocument>("drivers");

    const result = await collection.findOneAndUpdate(
      { id },
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

  static async delete(id: string): Promise<boolean> {
    const db = getDB();
    const collection = db.collection<DriverDocument>("drivers");

    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Helper method to seed the 2026 grid if the collection is empty
  static async seedIfEmpty(): Promise<void> {
    const db = getDB();
    const collection = db.collection<DriverDocument>("drivers");
    
    const count = await collection.countDocuments();
    if (count > 0) return;

    console.log("[SEED] Seeding 2026 F1 Drivers...");

    const initialDrivers: Omit<DriverDocument, "_id" | "createdAt" | "updatedAt">[] = [
      { id: "nor", name: "Lando Norris", team: "McLaren", number: 4, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#FF8000", isActive: true },
      { id: "pia", name: "Oscar Piastri", team: "McLaren", number: 81, country: "Australia", countryFlag: "🇦🇺", teamColor: "#FF8000", isActive: true },
      
      { id: "rus", name: "George Russell", team: "Mercedes", number: 63, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#C0C0C0", isActive: true },
      { id: "ant", name: "Kimi Antonelli", team: "Mercedes", number: 12, country: "Italy", countryFlag: "🇮🇹", teamColor: "#C0C0C0", isActive: true },
      
      { id: "lec", name: "Charles Leclerc", team: "Ferrari", number: 16, country: "Monaco", countryFlag: "🇲🇨", teamColor: "#FF0000", isActive: true },
      { id: "ham", name: "Lewis Hamilton", team: "Ferrari", number: 44, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#FF0000", isActive: true },
      
      { id: "ver", name: "Max Verstappen", team: "Red Bull Racing", number: 1, country: "Netherlands", countryFlag: "🇳🇱", teamColor: "#00008B", isActive: true },
      { id: "had", name: "Isack Hadjar", team: "Red Bull Racing", number: 21, country: "France", countryFlag: "🇫🇷", teamColor: "#00008B", isActive: true },
      
      { id: "alo", name: "Fernando Alonso", team: "Aston Martin", number: 14, country: "Spain", countryFlag: "🇪🇸", teamColor: "#004225", isActive: true },
      { id: "str", name: "Lance Stroll", team: "Aston Martin", number: 18, country: "Canada", countryFlag: "🇨🇦", teamColor: "#004225", isActive: true },
      
      { id: "gas", name: "Pierre Gasly", team: "Alpine", number: 10, country: "France", countryFlag: "🇫🇷", teamColor: "#FFC0CB", isActive: true },
      { id: "col", name: "Franco Colapinto", team: "Alpine", number: 43, country: "Argentina", countryFlag: "🇦🇷", teamColor: "#FFC0CB", isActive: true },
      
      { id: "alb", name: "Alexander Albon", team: "Williams", number: 23, country: "Thailand", countryFlag: "🇹🇭", teamColor: "#4169E1", isActive: true },
      { id: "sai", name: "Carlos Sainz", team: "Williams", number: 55, country: "Spain", countryFlag: "🇪🇸", teamColor: "#4169E1", isActive: true },
      
      { id: "oco", name: "Esteban Ocon", team: "Haas", number: 31, country: "France", countryFlag: "🇫🇷", teamColor: "#FFFFFF", isActive: true },
      { id: "bea", name: "Oliver Bearman", team: "Haas", number: 87, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#FFFFFF", isActive: true },
      
      { id: "law", name: "Liam Lawson", team: "Racing Bulls", number: 30, country: "New Zealand", countryFlag: "🇳🇿", teamColor: "#000080", isActive: true },
      { id: "lin", name: "Arvid Lindblad", team: "Racing Bulls", number: 39, country: "Great Britain", countryFlag: "🇬🇧", teamColor: "#000080", isActive: true },
      
      { id: "hul", name: "Nico Hülkenberg", team: "Audi", number: 27, country: "Germany", countryFlag: "🇩🇪", teamColor: "#000000", isActive: true },
      { id: "bor", name: "Gabriel Bortoleto", team: "Audi", number: 5, country: "Brazil", countryFlag: "🇧🇷", teamColor: "#000000", isActive: true },
      
      { id: "per", name: "Sergio Pérez", team: "Cadillac", number: 11, country: "Mexico", countryFlag: "🇲🇽", teamColor: "#7DF9FF", isActive: true },
      { id: "bot", name: "Valtteri Bottas", team: "Cadillac", number: 77, country: "Finland", countryFlag: "🇫🇮", teamColor: "#7DF9FF", isActive: true },
    ];

    const now = new Date();
    const documents = initialDrivers.map(d => ({
      ...d,
      createdAt: now,
      updatedAt: now,
    }));

    await collection.insertMany(documents);
    console.log("[SEED] Successfully seeded 22 drivers.");
  }

  static formatResponse(driver: DriverDocument) {
    return {
      _id: driver._id?.toString(),
      id: driver.id,
      name: driver.name,
      team: driver.team,
      number: driver.number,
      country: driver.country,
      countryFlag: driver.countryFlag,
      teamColor: driver.teamColor,
      isActive: driver.isActive
    };
  }
}
