import { MongoClient } from 'mongodb';

async function check() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/f1-predictor";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    const results = await db.collection('results').find({}).toArray();
    console.log("RESULTS:", JSON.stringify(results, null, 2));

  } finally {
    await client.close();
  }
}

check().catch(console.error);
