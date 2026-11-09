import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.DATABASE_URL ?? "";
  const cleaned = raw.replace(/[?&]sslmode=[^&]*/g, "");
  const out: Record<string, unknown> = {
    hasUrl: !!raw,
    host: raw.split("@")[1]?.split("/")[0] ?? "",
    hasQuotes: raw.startsWith('"') || raw.endsWith('"'),
    len: raw.length,
  };
  const attempt = async (label: string, cfg: Record<string, unknown>) => {
    const pool = new Pool({ connectionString: cleaned, max: 1, options: "-c search_path=visahobe_os,public", ...cfg } as never);
    try {
      const r = await pool.query("select current_database() as db, (select count(*) from information_schema.tables where table_schema='visahobe_os')::int as app_tables");
      out[label] = r.rows[0];
    } catch (e) {
      out[label] = String((e as Error).message).slice(0, 160);
    } finally { await pool.end().catch(() => {}); }
  };
  await attempt("noSsl", { ssl: false });
  await attempt("relaxedSsl", { ssl: { rejectUnauthorized: false } });
  return NextResponse.json(out);
}
