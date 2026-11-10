import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const rawUrl = process.env.DATABASE_URL ?? "";
// sslmode in the URL overrides the TLS options below, so it is stripped here
const databaseUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, "") || rawUrl;

if (!rawUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    // Managed Postgres (Supabase/Neon poolers) present a self-signed chain on some regions
    ssl: /supabase|neon|render|amazonaws|pooler/i.test(databaseUrl) ? { rejectUnauthorized: false } : undefined,
    max: 5,
    // A dedicated schema keeps this workspace isolated from other apps on the same database
    options: "-c search_path=visahobe_os,public",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);

export { ensureSchema } from "./ensure";
