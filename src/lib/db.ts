import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DATABASE_NAME = process.env.DATABASE_NAME || "enterpriseapp";

if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached = globalThis.mongoose ?? { conn: null, promise: null };
if (process.env.NODE_ENV !== "production") globalThis.mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
