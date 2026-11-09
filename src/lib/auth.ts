import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

const COOKIE = "b44_session";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSession(userId: number) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(sessions).values({ id, userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) await db.delete(sessions).where(eq(sessions.id, id));
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@visa44.com";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

/** Guarantees at least one admin account exists. */
export async function ensureAdmin() {
  try {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
    if (existing) return;
    const email = DEFAULT_ADMIN_EMAIL.toLowerCase();
    const [byEmail] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (byEmail) {
      await db.update(users).set({ role: "admin" }).where(eq(users.id, byEmail.id));
      return;
    }
    await db.insert(users).values({
      email,
      name: "Admin",
      role: "admin",
      plan: "pro",
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      apiKey: `v44_${randomBytes(24).toString("hex")}`,
    });
  } catch {
    /* ignore */
  }
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export function safeNext(next: unknown) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "";
}
