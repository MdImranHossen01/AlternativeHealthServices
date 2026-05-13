import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function check() {
  loadEnvFile();
  const mongoUri = process.env.MONGODB_URI;
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const settings = await db.collection("globalsettings").find({ domain: "elyjen.shop" }).toArray();
  console.log(`Found ${settings.length} settings for elyjen.shop`);
  if (settings.length > 0) {
    console.log("Settings found:", JSON.stringify(settings[0], null, 2));
  } else {
    console.log("No settings found for elyjen.shop!");
  }
  await mongoose.disconnect();
}

check().catch(console.error);
