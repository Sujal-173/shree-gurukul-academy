import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "gurukul_academy";

type MongoGlobal = typeof globalThis & { __gurukulMongoPromise?: Promise<MongoClient>; __gurukulIndexesPromise?: Promise<void> };
const globalForMongo = globalThis as MongoGlobal;

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not configured. Set it in .env.local.");
  if (!globalForMongo.__gurukulMongoPromise) {
    const client = new MongoClient(uri, {
      appName: "shri-gurukul-academy",
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      retryWrites: true,
    });
    globalForMongo.__gurukulMongoPromise = client.connect().catch((error) => {
      globalForMongo.__gurukulMongoPromise = undefined;
      throw error;
    });
  }
  const client = await globalForMongo.__gurukulMongoPromise;
  const db = client.db(dbName);
  if (!globalForMongo.__gurukulIndexesPromise) {
    globalForMongo.__gurukulIndexesPromise = Promise.all([
      db.collection("inquiries").createIndex({ createdAt: -1 }),
      db.collection("inquiries").createIndex({ status: 1, createdAt: -1 }),
      db.collection("media").createIndex({ createdAt: -1 }),
      db.collection("siteContentVersions").createIndex({ archivedAt: -1 }),
    ]).then(() => undefined).catch((error) => {
      globalForMongo.__gurukulIndexesPromise = undefined;
      throw error;
    });
  }
  await globalForMongo.__gurukulIndexesPromise;
  return db;
}
