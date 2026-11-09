import { cache } from "react";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { siteContent, siteContentHistory } from "@/db/schema";
import { DEFAULTS, FIELD_MAP, normalizeValue, resolveContent, type Content } from "@/lib/site-fields";

export async function readRawContent(): Promise<Content> {
  const out: Content = { ...DEFAULTS };
  try {
    const rows = await db.select().from(siteContent);
    for (const r of rows) if (r.key in out) out[r.key] = r.value;
  } catch {
    // DB not ready (e.g. during static prerender) — fall back to defaults
  }
  return out;
}

export const getRawContent = cache(readRawContent);
export const getContent = cache(async () => resolveContent(await getRawContent()));

export function sanitizeChanges(changes: Content) {
  const valid: Content = {};
  const rejected: string[] = [];
  for (const [k, v] of Object.entries(changes)) {
    if (!FIELD_MAP[k]) {
      rejected.push(k);
      continue;
    }
    const n = normalizeValue(k, String(v));
    if (n === null) rejected.push(k);
    else valid[k] = n;
  }
  return { valid, rejected };
}

async function writeValues(values: Content) {
  const toDelete = Object.keys(values).filter((k) => values[k] === DEFAULTS[k]);
  const toUpsert = Object.entries(values).filter(([k, v]) => v !== DEFAULTS[k]);
  if (toDelete.length) await db.delete(siteContent).where(inArray(siteContent.key, toDelete));
  for (const [key, value] of toUpsert) {
    await db
      .insert(siteContent)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteContent.key, set: { value, updatedAt: new Date() } });
  }
}

export async function applyContentChanges(changes: Content, userId: number | null, summary: string) {
  const { valid, rejected } = sanitizeChanges(changes);
  const before = await readRawContent();
  const actual: Content = {};
  for (const [k, v] of Object.entries(valid)) if (before[k] !== v) actual[k] = v;
  if (Object.keys(actual).length === 0) return { applied: actual, rejected };
  await db.insert(siteContentHistory).values({ userId, summary: summary.slice(0, 300), snapshot: before });
  await writeValues(actual);
  return { applied: actual, rejected };
}

export async function undoLastChange() {
  const [last] = await db.select().from(siteContentHistory).orderBy(desc(siteContentHistory.id)).limit(1);
  if (!last) return null;
  const snapshot = { ...DEFAULTS, ...last.snapshot };
  await db.delete(siteContent);
  await writeValues(snapshot);
  await db.delete(siteContentHistory).where(eq(siteContentHistory.id, last.id));
  return last;
}
