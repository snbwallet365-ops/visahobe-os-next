"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, ensureSchema } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, ensureAdmin, hashPassword, safeNext, verifyPassword } from "@/lib/auth";
import { randomToken } from "@/lib/utils";
import { createProjectForUser } from "@/lib/projects";

export type AuthState = { error?: string; info?: string } | undefined;

async function afterAuth(userId: number, role: string, formData: FormData): Promise<never> {
  const prompt = String(formData.get("prompt") ?? "").trim();
  const category = String(formData.get("category") ?? "Apps");
  const next = safeNext(formData.get("next"));
  if (prompt) {
    const id = await createProjectForUser(userId, prompt.slice(0, 2000), category);
    redirect(`/dashboard/projects/${id}`);
  }
  if (next) redirect(next);
  redirect(role === "admin" ? "/admin" : "/dashboard");
}

export async function signupAction(_: AuthState, formData: FormData): Promise<AuthState> {
  await ensureSchema();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: "An account with this email already exists. Try logging in." };

  const [user] = await db
    .insert(users)
    .values({ email, name: email.split("@")[0], passwordHash: hashPassword(password), apiKey: `v44_${randomToken(32)}` })
    .returning();
  await createSession(user.id);
  return afterAuth(user.id, user.role, formData);
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  await ensureSchema();
  await ensureAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "Invalid email or password." };
  await createSession(user.id);
  return afterAuth(user.id, user.role, formData);
}

export async function ssoAction(provider: string): Promise<AuthState> {
  await ensureSchema();
  const envKey = `${provider.toUpperCase()}_CLIENT_ID`;
  const nice = provider[0].toUpperCase() + provider.slice(1);
  if (!process.env[envKey]) {
    return { info: `${nice} sign-in isn't configured on this deployment yet (set ${envKey}). Please continue with email and password.` };
  }
  return { info: `Redirecting to ${nice}…` };
}

export async function logoutAction() {
  await ensureSchema();
  await destroySession();
  redirect("/");
}
