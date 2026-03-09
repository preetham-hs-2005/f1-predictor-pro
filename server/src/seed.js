const { MongoClient } = require('mongodb');

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/f1-predictor";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    await db.collection('results').insertOne({
        raceId: "australia-2026",
        type: "race",
        p1: "max_verstappen",
        p2: "charles_leclerc",
        p3: "lando_norris",
        pole: "charles_leclerc",
        fastestLap: "max_verstappen",
        dnfCount: 2,
        safetyCars: 1,
        redFlags: 0,
        bestConstructor: "Red Bull Racing",
        isOfficial: true,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log("Seeded Australia result!");
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
