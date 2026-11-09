import { pool } from "./index";
import { SCHEMA_SQL } from "./schema.sql";

let done = false;
let running: Promise<void> | null = null;

/** Creates this workspace's schema and tables on first use. Safe to call on every request. */
export async function ensureSchema() {
  if (done) return;
  if (running) return running;
  running = (async () => {
    const client = await pool.connect();
    try {
      await client.query("create schema if not exists visahobe_os");
      await client.query("set search_path to visahobe_os, public");
      await client.query(SCHEMA_SQL);
      done = true;
    } catch (e) {
      console.error("[ensureSchema]", (e as Error).message);
    } finally {
      client.release();
      running = null;
    }
  })();
  return running;
}
