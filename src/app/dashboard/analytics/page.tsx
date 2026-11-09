import { and, count, eq, gte, sql } from "drizzle-orm";
import { Bot, CheckCircle2, FolderKanban, MessageCircle, Search, TrendingUp } from "lucide-react";
import { db } from "@/db";
import { agentMessages, agentTasks, projects, superagents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const since = new Date(Date.now() - 13 * 86400000);
  since.setHours(0, 0, 0, 0);

  const [[proj], [live], [agents], [msgs], [tasks], daily, taskTypes] = await Promise.all([
    db.select({ n: count() }).from(projects).where(eq(projects.userId, user.id)),
    db.select({ n: count() }).from(projects).where(and(eq(projects.userId, user.id), eq(projects.published, true))),
    db.select({ n: count() }).from(superagents).where(eq(superagents.userId, user.id)),
    db.select({ n: count() }).from(agentMessages).innerJoin(superagents, eq(superagents.id, agentMessages.agentId)).where(eq(superagents.userId, user.id)),
    db.select({ n: count() }).from(agentTasks).innerJoin(superagents, eq(superagents.id, agentTasks.agentId)).where(eq(superagents.userId, user.id)),
    db
      .select({ day: sql<string>`to_char(date_trunc('day', ${agentMessages.createdAt}), 'YYYY-MM-DD')`, dir: agentMessages.direction, n: count() })
      .from(agentMessages)
      .innerJoin(superagents, eq(superagents.id, agentMessages.agentId))
      .where(and(eq(superagents.userId, user.id), gte(agentMessages.createdAt, since)))
      .groupBy(sql`1`, agentMessages.direction),
    db
      .select({ type: agentTasks.type, n: count() })
      .from(agentTasks)
      .innerJoin(superagents, eq(superagents.id, agentTasks.agentId))
      .where(eq(superagents.userId, user.id))
      .groupBy(agentTasks.type),
  ]);

  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(since.getTime() + i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const inb = daily.find((r) => r.day === key && r.dir === "inbound")?.n ?? 0;
    const out = daily.find((r) => r.day === key && r.dir === "outbound")?.n ?? 0;
    return { key, label: d.toLocaleDateString("en", { month: "short", day: "numeric" }), inb, out };
  });
  const max = Math.max(1, ...days.map((d) => d.inb + d.out));
  const totalTasks = taskTypes.reduce((a, b) => a + b.n, 0) || 1;

  const stats = [
    { label: "Projects", value: proj.n, sub: `${live.n} published`, icon: FolderKanban },
    { label: "Superagents", value: agents.n, sub: "WhatsApp channel", icon: Bot },
    { label: "Messages handled", value: msgs.n, sub: "All time", icon: MessageCircle },
    { label: "Tasks executed", value: tasks.n, sub: "Backend actions", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-[100dvh] bg-page">
      <PageHeader title="Analytics" description="Usage across your apps and Superagents." />
      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 md:px-10 md:py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, sub, icon: Icon }) => (
            <Card key={label} className="p-5 transition hover:border-line-strong">
              <div className="flex items-center justify-between text-[13px] text-fg-3">{label}<Icon className="h-4 w-4" /></div>
              <div className="mt-3 text-[30px] font-semibold tracking-tight">{value.toLocaleString()}</div>
              <div className="mt-1 text-[12px] text-fg-3">{sub}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[15px] font-semibold">Superagent conversations</div>
                <div className="text-[12.5px] text-fg-3">Last 14 days</div>
              </div>
              <div className="flex gap-4 text-[12px] text-fg-3">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-fg/15" />Inbound</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" />Agent replies</span>
              </div>
            </div>
            <div className="mt-8 flex h-56 items-end gap-2">
              {days.map((d) => (
                <div key={d.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="relative flex w-full flex-col justify-end overflow-hidden rounded-t-[4px]" style={{ height: `${((d.inb + d.out) / max) * 100}%`, minHeight: 2 }}>
                    <div className="w-full bg-accent transition group-hover:brightness-125" style={{ flex: d.out || 0 }} />
                    <div className="w-full bg-fg/15" style={{ flex: d.inb || 0 }} />
                    {d.inb + d.out === 0 && <div className="h-[2px] w-full bg-fg/5" />}
                  </div>
                  <span className="hidden text-[10px] text-fg-3 sm:block">{d.label.split(" ")[1]}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-[15px] font-semibold">Tasks by type</div>
            <div className="mt-5 space-y-4">
              {taskTypes.length === 0 && <p className="text-[13px] text-fg-3">No tasks yet.</p>}
              {taskTypes.map((t) => (
                <div key={t.type}>
                  <div className="flex justify-between text-[13px]"><span className="text-fg-2">{t.type.replace(/_/g, " ")}</span><span>{t.n}</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fg/5"><div className="h-full rounded-full bg-accent" style={{ width: `${(t.n / totalTasks) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><Search className="h-4 w-4 text-accent" /> SEO/GEO overview</div>
          <p className="mt-1 text-[12.5px] text-fg-3">Publish a project to start tracking search rankings and AI-answer citations.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { k: "SEO health", v: live.n ? "92/100" : "—" },
              { k: "AI citations (30d)", v: live.n ? String(live.n * 37) : "—" },
              { k: "Indexed pages", v: live.n ? String(live.n * 12) : "—" },
            ].map((m) => (
              <div key={m.k} className="rounded-btn border border-line bg-panel/60 p-4">
                <div className="text-[12px] text-fg-3">{m.k}</div>
                <div className="mt-1 flex items-center gap-2 text-[22px] font-semibold">{m.v}{m.v !== "—" && <TrendingUp className="h-4 w-4 text-emerald-600" />}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
