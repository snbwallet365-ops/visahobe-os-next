import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { ArrowRight, Headset, MessageCircle, ShieldCheck } from "lucide-react";
import { db } from "@/db";
import { agentMessages, superagents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/input";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";

export const dynamic = "force-dynamic";

export default async function SuperagentsPage() {
  const [user, c] = await Promise.all([requireUser(), getContent()]);
  const agents = await db.select().from(superagents).where(eq(superagents.userId, user.id)).orderBy(desc(superagents.createdAt));
  const counts = await db
    .select({ agentId: agentMessages.agentId, n: count() })
    .from(agentMessages)
    .innerJoin(superagents, eq(superagents.id, agentMessages.agentId))
    .where(eq(superagents.userId, user.id))
    .groupBy(agentMessages.agentId);
  const byAgent = new Map(counts.map((x) => [x.agentId, x.n]));

  return (
    <div className="min-h-[100dvh] bg-page">
      <PageHeader title={c["sa.eyebrow"]} description="AI agents that work 24/7 across WhatsApp and your app's backend." />
      <div className="mx-auto max-w-[1160px] space-y-8 px-4 py-6 md:px-10 md:py-8">
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">{c["sa.templatesTitle"]}</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {AGENT_TEMPLATES.map((t) => (
              <Link key={t.id} href={`/agents/new?template=${t.id}`} className="group flex flex-col rounded-card border border-line bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-float active:scale-[0.98]">
                <span className="grid h-10 w-10 place-items-center rounded-btn bg-panel text-[20px]">{t.emoji}</span>
                <span className="mt-3 text-[14.5px] font-semibold">{c[`${t.contentKey}Title`]}</span>
                <span className="mt-1 flex-1 text-[12.5px] leading-snug text-fg-3">{c[`${t.contentKey}Desc`]}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent">Create <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[15px] font-semibold">Your Superagents <span className="font-normal text-fg-3">{agents.length}</span></h2>
          {agents.length === 0 ? (
            <div className="rounded-card border border-dashed border-line-strong bg-panel/50 px-6 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-[22px]">🤖</div>
              <p className="mt-3 text-[15px] font-medium">No Superagents yet</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-fg-3">Tap a template above — your agent is created instantly and ready to test.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((a) => (
                <Link key={a.id} href={`/dashboard/superagents/${a.id}`} className="group rounded-card border border-line bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-float active:scale-[0.98] md:p-5">
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-btn bg-[#25D366]/10 text-[#128C7E]"><MessageCircle className="h-5 w-5" /></span>
                    {a.status === "active" ? <Badge tone="green"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />Running</Badge> : <Badge tone="amber">Paused</Badge>}
                  </div>
                  <h3 className="mt-3 text-[16px] font-semibold">{a.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-fg-3">{a.description}</p>
                  <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-[12px] text-fg-3">
                    <span className="flex items-center gap-1">{a.role === "supervisor" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Headset className="h-3.5 w-3.5" />}{a.role === "supervisor" ? "Supervisor" : "Support"}</span>
                    <span>·</span>
                    <span>{byAgent.get(a.id) ?? 0} msgs</span>
                    <span className="ml-auto">{a.webhookVerifiedAt ? "Webhook ✓" : "Simulator"}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
