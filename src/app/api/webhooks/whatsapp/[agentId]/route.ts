import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { superagents } from "@/db/schema";
import { handleIncomingMessage } from "@/lib/agent-engine";

export const dynamic = "force-dynamic";

async function loadAgent(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return null;
  const [agent] = await db.select().from(superagents).where(eq(superagents.id, id)).limit(1);
  return agent ?? null;
}

// Meta webhook verification handshake
export async function GET(req: Request, ctx: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await ctx.params;
  const agent = await loadAgent(agentId);
  if (!agent) return new Response("Not found", { status: 404 });
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === agent.verifyToken) {
    await db.update(superagents).set({ webhookVerifiedAt: new Date() }).where(eq(superagents.id, agent.id));
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

type WAPayload = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id: string; profile?: { name?: string } }[];
        messages?: { from: string; type: string; text?: { body: string } }[];
      };
    }[];
  }[];
};

export async function POST(req: Request, ctx: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await ctx.params;
  const agent = await loadAgent(agentId);
  if (!agent) return new Response("Not found", { status: 404 });

  const raw = await req.text();
  if (agent.appSecret) {
    const sig = req.headers.get("x-hub-signature-256") ?? "";
    const expected = "sha256=" + createHmac("sha256", agent.appSecret).update(raw).digest("hex");
    const ok = sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) return new Response("Invalid signature", { status: 401 });
  }

  let payload: WAPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  let processed = 0;
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const names = new Map((value?.contacts ?? []).map((c) => [c.wa_id, c.profile?.name ?? ""]));
      for (const m of value?.messages ?? []) {
        if (m.type !== "text" || !m.text?.body) continue;
        await handleIncomingMessage(agent, {
          contact: m.from,
          contactName: names.get(m.from) ?? "",
          body: m.text.body,
          source: "webhook",
        });
        processed++;
      }
    }
  }
  return Response.json({ ok: true, processed });
}
