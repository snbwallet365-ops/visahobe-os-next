import { NextResponse } from "next/server";
import { pool, ensureSchema } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = {};
  try {
    await ensureSchema();
    const c = await pool.connect();
    try {
      await c.query("set search_path to visahobe_os, public");
      const t = await c.query("select table_name from information_schema.tables where table_schema='visahobe_os' order by 1");
      out.tables = t.rows.map((r) => r.table_name);
      const cols = await c.query("select column_name, data_type from information_schema.columns where table_schema='visahobe_os' and table_name='users' order by ordinal_position");
      out.userColumns = cols.rows;
      const ins = await c.query(
        "insert into visahobe_os.users (email, name, password_hash, plan, role, api_key) values ($1,$2,$3,'free','user',$4) on conflict (email) do nothing returning id",
        [`probe+${Date.now()}@example.com`, "probe", "hash", `v44_${Math.random().toString(36).slice(2)}`],
      );
      out.insertOk = ins.rowCount;
    } finally { c.release(); }
  } catch (e) {
    out.error = String((e as Error).message).slice(0, 300);
    out.detail = String((e as { detail?: string }).detail ?? "").slice(0, 200);
  }
  return NextResponse.json(out);
}
