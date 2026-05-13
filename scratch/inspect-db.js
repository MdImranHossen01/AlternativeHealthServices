const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb://localhost:27017/elyjen"; // Adjust if needed
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("elyjen");
    const product = await db.collection("products").findOne({ name: /Craceful new balance White sneakers/i });
    console.log(JSON.stringify(product, null, 2));
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
