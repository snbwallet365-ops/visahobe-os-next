"use server";

import { and, desc, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/db";
import { adminChatMessages, projects, superagents, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { applyContentChanges, readRawContent, undoLastChange } from "@/lib/content";
import { interpretCommand, llmCommand } from "@/lib/admin-agent";
import { DEFAULTS, FIELDS, FIELD_MAP, type Content } from "@/lib/site-fields";

function refreshAll() {
  revalidatePath("/", "layout");
}

export type ContentSaveState = { ok?: boolean; error?: string; count?: number } | undefined;

export async function saveContentAction(changes: Content): Promise<ContentSaveState> {
  await ensureSchema();
  const admin = await requireAdmin();
  const { applied, rejected } = await applyContentChanges(changes, admin.id, `Editor: ${Object.keys(changes).length} field(s)`);
  refreshAll();
  if (rejected.length) return { error: `Invalid value for: ${rejected.map((k) => FIELD_MAP[k]?.label ?? k).join(", ")}`, count: Object.keys(applied).length };
  return { ok: true, count: Object.keys(applied).length };
}

export async function resetSectionAction(section: string): Promise<ContentSaveState> {
  await ensureSchema();
  const admin = await requireAdmin();
  const ch: Content = {};
  for (const f of FIELDS) if (section === "all" || f.section === section) ch[f.key] = DEFAULTS[f.key];
  const { applied } = await applyContentChanges(ch, admin.id, `Reset ${section}`);
  refreshAll();
  return { ok: true, count: Object.keys(applied).length };
}

export async function undoContentAction() {
  await ensureSchema();
  await requireAdmin();
  await undoLastChange();
  refreshAll();
}

export async function adminChatAction(message: string) {
  await ensureSchema();
  const admin = await requireAdmin();
  const text = message.trim().slice(0, 4000);
  if (!text) return;
  await db.insert(adminChatMessages).values({ userId: admin.id, role: "user", content: text });

  const content = await readRawContent();
  const history = await db
    .select({ role: adminChatMessages.role, content: adminChatMessages.content })
    .from(adminChatMessages)
    .where(eq(adminChatMessages.userId, admin.id))
    .orderBy(desc(adminChatMessages.id))
    .limit(9);
  const hist = history.reverse().slice(0, -1).map((h) => ({ role: h.role === "user" ? "user" : "assistant", content: h.content }));

  const result = (await llmCommand(text, content, hist)) ?? interpretCommand(text, content);
  let reply = result.reply;
  let applied: Content = {};

  if (result.action === "undo") {
    const last = await undoLastChange();
    reply = last ? `↩️ Undone: ${last.summary || "last change"}. The site is back to how it was before.` : "Nothing to undo yet.";
  } else if (Object.keys(result.changes).length) {
    const out = await applyContentChanges(result.changes, admin.id, `AI: ${text}`);
    applied = out.applied;
    if (out.rejected.length) reply += `\n\n⚠️ Skipped invalid values for: ${out.rejected.map((k) => FIELD_MAP[k]?.label ?? k).join(", ")}`;
    if (!Object.keys(applied).length && !out.rejected.length) reply += "\n\n(Already set — nothing changed.)";
  }

  await db.insert(adminChatMessages).values({ userId: admin.id, role: "assistant", content: reply || "Done.", changes: applied });
  refreshAll();
}

export async function clearAdminChatAction() {
  await ensureSchema();
  const admin = await requireAdmin();
  await db.delete(adminChatMessages).where(eq(adminChatMessages.userId, admin.id));
  revalidatePath("/admin/assistant");
}

/* -------- Users & data -------- */

export async function setUserRoleAction(userId: number, role: string) {
  await ensureSchema();
  const admin = await requireAdmin();
  if (userId === admin.id || !["admin", "user"].includes(role)) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function setUserPlanAction(userId: number, plan: string) {
  await ensureSchema();
  await requireAdmin();
  if (!["free", "starter", "builder", "pro"].includes(plan)) return;
  await db.update(users).set({ plan }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function deleteUserAction(userId: number) {
  await ensureSchema();
  const admin = await requireAdmin();
  await db.delete(users).where(and(eq(users.id, userId), ne(users.id, admin.id)));
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function adminDeleteProjectAction(id: number) {
  await ensureSchema();
  await requireAdmin();
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/admin");
}

export async function adminToggleAgentAction(id: number) {
  await ensureSchema();
  await requireAdmin();
  const [a] = await db.select().from(superagents).where(eq(superagents.id, id)).limit(1);
  if (!a) return;
  await db.update(superagents).set({ status: a.status === "active" ? "paused" : "active" }).where(eq(superagents.id, id));
  revalidatePath("/admin");
}
