import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { agentMessages, agentTasks, superagents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { AgentHub } from "@/components/dashboard/agent-hub";

export const dynamic = "force-dynamic";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const aid = Number(id);
  if (!Number.isInteger(aid)) notFound();
  const [agent] = await db.select().from(superagents).where(and(eq(superagents.id, aid), eq(superagents.userId, user.id))).limit(1);
  if (!agent) notFound();

  const [messages, tasks] = await Promise.all([
    db.select().from(agentMessages).where(eq(agentMessages.agentId, aid)).orderBy(desc(agentMessages.id)).limit(300),
    db.select().from(agentTasks).where(eq(agentTasks.agentId, aid)).orderBy(desc(agentTasks.id)).limit(100),
  ]);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const webhookUrl = `${proto}://${host}/api/webhooks/whatsapp/${agent.id}`;

  return (
    <AgentHub
      agent={{
        ...agent,
        webhookVerifiedAt: agent.webhookVerifiedAt?.toISOString() ?? null,
        createdAt: agent.createdAt.toISOString(),
      }}
      messages={messages.reverse().map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
      tasks={tasks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() }))}
      webhookUrl={webhookUrl}
      llmEnabled={!!process.env.OPENAI_API_KEY}
    />
  );
}
