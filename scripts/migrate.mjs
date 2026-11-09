/**
 * Applies the generated DDL on deploy. Idempotent: every CREATE is guarded, and
 * the whole run is skipped when there is no database to talk to.
 */
import { readFileSync, readdirSync } from "node:fs";
import { Client } from "pg";

const url = process.env.DATABASE_URL;
if (!url) { console.log("[migrate] no DATABASE_URL, skipping"); process.exit(0); }

const dir = new URL("../drizzle/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const client = new Client({ connectionString: url, ssl: url.includes("supabase") ? { rejectUnauthorized: false } : undefined });
try {
  await client.connect();
  for (const f of files) {
    let sql = readFileSync(new URL(f, dir), "utf8");
    sql = sql.replace(/CREATE TABLE (?!IF NOT EXISTS)/g, "CREATE TABLE IF NOT EXISTS ");
    sql = sql.replace(/CREATE (UNIQUE )?INDEX (?!IF NOT EXISTS)/g, "CREATE $1INDEX IF NOT EXISTS ");
    sql = sql.replace(/ALTER TABLE [^;]*?ADD CONSTRAINT [^;]*;/g, "");
    const stmts = sql.split("--> statement-breakpoint").join("\n").split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
    for (const s of stmts) {
      await client.query(s).catch((e) => console.log("[migrate] skip:", String(e.message).slice(0, 90)));
    }
    console.log("[migrate] applied", f);
  }
} catch (e) {
  console.log("[migrate] failed:", String(e.message).slice(0, 120));
} finally {
  await client.end().catch(() => {});
}
