"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { integrations, projectMessages, projects, superagents, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { createProjectForUser, followUpReply } from "@/lib/projects";
import { handleIncomingMessage } from "@/lib/agent-engine";
import { createAgentFromTemplate } from "@/lib/agents";
import { randomToken } from "@/lib/utils";

/* ---------------- Projects ---------------- */

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const category = String(formData.get("category") ?? "Apps");
  if (!prompt) return;
  const id = await createProjectForUser(user.id, prompt.slice(0, 2000), category);
  redirect(`/dashboard/projects/${id}`);
}

async function ownedProject(userId: number, id: number) {
  const [p] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);
  return p;
}

export async function sendProjectMessageAction(projectId: number, message: string) {
  const user = await requireUser();
  const p = await ownedProject(user.id, projectId);
  if (!p || !message.trim()) return;
  await db.insert(projectMessages).values([
    { projectId, role: "user", content: message.trim().slice(0, 2000) },
    { projectId, role: "assistant", content: followUpReply(message) },
  ]);
  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function togglePublishAction(projectId: number) {
  const user = await requireUser();
  const p = await ownedProject(user.id, projectId);
  if (!p) return;
  await db.update(projects).set({ published: !p.published, status: !p.published ? "live" : "ready", updatedAt: new Date() }).where(eq(projects.id, projectId));
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteProjectAction(projectId: number) {
  const user = await requireUser();
  await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/* ---------------- Superagents ---------------- */

export async function createAgentAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const template = String(formData.get("template") ?? "whatsapp_support");
  const id = await createAgentFromTemplate(user.id, template, name);
  redirect(`/dashboard/superagents/${id}`);
}

async function ownedAgent(userId: number, id: number) {
  const [a] = await db.select().from(superagents).where(and(eq(superagents.id, id), eq(superagents.userId, userId))).limit(1);
  return a;
}

export type SaveState = { ok?: boolean; error?: string } | undefined;

export async function saveAgentConnectionAction(agentId: number, _: SaveState, formData: FormData): Promise<SaveState> {
  const user = await requireUser();
  if (!(await ownedAgent(user.id, agentId))) return { error: "Agent not found" };
  await db
    .update(superagents)
    .set({
      phoneNumberId: String(formData.get("phoneNumberId") ?? "").trim(),
      businessAccountId: String(formData.get("businessAccountId") ?? "").trim(),
      accessToken: String(formData.get("accessToken") ?? "").trim(),
      appSecret: String(formData.get("appSecret") ?? "").trim(),
      verifyToken: String(formData.get("verifyToken") ?? "").trim() || `v44_verify_${randomToken(16)}`,
    })
    .where(eq(superagents.id, agentId));
  revalidatePath(`/dashboard/superagents/${agentId}`);
  return { ok: true };
}

export async function saveAgentLogicAction(agentId: number, _: SaveState, formData: FormData): Promise<SaveState> {
  const user = await requireUser();
  if (!(await ownedAgent(user.id, agentId))) return { error: "Agent not found" };
  const systemPrompt = String(formData.get("systemPrompt") ?? "").trim();
  if (!systemPrompt) return { error: "Instructions can't be empty." };
  await db
    .update(superagents)
    .set({
      name: String(formData.get("name") ?? "").trim() || "Superagent",
      role: String(formData.get("role") ?? "customer_support"),
      model: String(formData.get("model") ?? "gpt-4o-mini"),
      systemPrompt,
      escalationKeywords: String(formData.get("escalationKeywords") ?? ""),
      tools: formData.getAll("tools").map(String),
    })
    .where(eq(superagents.id, agentId));
  revalidatePath(`/dashboard/superagents/${agentId}`);
  revalidatePath("/dashboard/superagents");
  return { ok: true };
}

export async function toggleAgentStatusAction(agentId: number) {
  const user = await requireUser();
  const a = await ownedAgent(user.id, agentId);
  if (!a) return;
  await db.update(superagents).set({ status: a.status === "active" ? "paused" : "active" }).where(eq(superagents.id, agentId));
  revalidatePath(`/dashboard/superagents/${agentId}`);
  revalidatePath("/dashboard/superagents");
}

export async function deleteAgentAction(agentId: number) {
  const user = await requireUser();
  await db.delete(superagents).where(and(eq(superagents.id, agentId), eq(superagents.userId, user.id)));
  revalidatePath("/dashboard/superagents");
  redirect("/dashboard/superagents");
}

export async function simulateMessageAction(agentId: number, contact: string, contactName: string, body: string) {
  const user = await requireUser();
  const a = await ownedAgent(user.id, agentId);
  if (!a || !body.trim()) return;
  await handleIncomingMessage(a, { contact: contact || "15550001234", contactName, body: body.trim().slice(0, 1000), source: "simulator" });
  revalidatePath(`/dashboard/superagents/${agentId}`);
}

/* ---------------- Integrations ---------------- */

export async function toggleIntegrationAction(provider: string) {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.userId, user.id), eq(integrations.provider, provider)))
    .limit(1);
  if (row) await db.delete(integrations).where(eq(integrations.id, row.id));
  else await db.insert(integrations).values({ userId: user.id, provider });
  revalidatePath("/dashboard/integrations");
}

/* ---------------- Settings ---------------- */

export async function updateProfileAction(_: SaveState, formData: FormData): Promise<SaveState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  await db.update(users).set({ name }).where(eq(users.id, user.id));
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function rotateApiKeyAction() {
  const user = await requireUser();
  await db.update(users).set({ apiKey: `v44_${randomToken(32)}` }).where(eq(users.id, user.id));
  revalidatePath("/dashboard/settings");
}
