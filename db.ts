import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

export const db = drizzle(pool, { schema });

export async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isEndpointDisabled =
        err?.message?.includes("endpoint has been disabled") ||
        err?.message?.includes("Connection terminated") ||
        err?.code === "XX000";

      if (isEndpointDisabled && attempt < retries) {
        console.log(`DB connection attempt ${attempt} failed (endpoint waking up), retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay * attempt));
      } else {
        throw err;
      }
    }
  }
  throw new Error("All database retry attempts failed");
}
