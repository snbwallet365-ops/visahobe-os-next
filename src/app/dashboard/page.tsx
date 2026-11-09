import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { AppWindow, ArrowRight, Clock, Gamepad2, Globe, Wrench } from "lucide-react";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { PromptBox } from "@/components/landing/prompt-box";
import { Badge } from "@/components/ui/input";
import { timeAgo } from "@/lib/utils";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";

export const dynamic = "force-dynamic";

const ICONS = { Apps: AppWindow, Websites: Globe, Games: Gamepad2, Tools: Wrench } as const;
const GRADS = [
  "from-[#FFD7C2] to-[#FF9E7A]",
  "from-[#DCE4FF] to-[#9DB3FF]",
  "from-[#D3F5E6] to-[#7ED9B0]",
  "from-[#FFE0EE] to-[#FF9EC6]",
  "from-[#FFF0C7] to-[#FFCE6B]",
  "from-[#E3F4FF] to-[#8FD0FF]",
];

export default async function DashboardHome() {
  const [user, c] = await Promise.all([requireUser(), getContent()]);
  const list = await db.select().from(projects).where(eq(projects.userId, user.id)).orderBy(desc(projects.updatedAt));

  return (
    <div className="relative min-h-[100dvh] bg-page">
      <div className="hero-glow pointer-events-none absolute left-1/2 top-0 h-72 w-[760px] max-w-[160vw] -translate-x-1/2 opacity-50" />
      <section className="relative mx-auto max-w-[740px] px-4 pb-8 pt-10 text-center md:pb-12 md:pt-20">
        <p className="text-[14px] font-medium text-fg-3">Hi {user.name} 👋</p>
        <h1 className="mt-1 text-[30px] font-semibold leading-tight tracking-[-0.035em] md:text-[42px]">{c["dash.heading"]}</h1>
        <p className="mx-auto mt-2 max-w-[520px] text-[14.5px] text-fg-2">{c["dash.subheading"]}</p>
        <div className="mt-6 text-left md:mt-8"><PromptBox c={c} /></div>
      </section>

      <section className="relative mx-auto max-w-[1160px] px-4 pb-8 md:px-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold">{c["dash.agentsTitle"]}</h2>
          <Link href="/dashboard/superagents" className="flex items-center gap-1 text-[13px] font-medium text-accent">See all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {AGENT_TEMPLATES.map((t) => (
            <Link key={t.id} href={`/agents/new?template=${t.id}`} className="group w-[210px] shrink-0 snap-start rounded-card border border-line bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-float active:scale-[0.98] md:w-auto">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-btn bg-panel text-[18px]">{t.emoji}</span>
                <span className="text-[14px] font-semibold leading-tight">{c[`${t.contentKey}Title`]}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-[12.5px] text-fg-3">{c[`${t.contentKey}Desc`]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-[1160px] px-4 pb-16 md:px-10">
        <h2 className="mb-3 text-[16px] font-semibold">{c["dash.projectsTitle"]} <span className="ml-1 font-normal text-fg-3">{list.length}</span></h2>
        {list.length === 0 ? (
          <div className="rounded-card border border-dashed border-line-strong bg-panel/50 px-6 py-14 text-center">
            <AppWindow className="mx-auto h-8 w-8 text-fg-3" />
            <p className="mt-3 text-[15px] font-medium">{c["dash.emptyTitle"]}</p>
            <p className="mt-1 text-[13px] text-fg-3">{c["dash.emptyDesc"]}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
            {list.map((p, i) => {
              const Icon = ICONS[p.category as keyof typeof ICONS] ?? AppWindow;
              return (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="group overflow-hidden rounded-card border border-line bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-float active:scale-[0.98]">
                  <div className={`relative h-24 bg-gradient-to-br md:h-36 ${GRADS[i % GRADS.length]}`}>
                    <div className="absolute inset-x-3 bottom-0 top-5 rounded-t-[10px] border border-white/70 bg-white/70 p-2.5 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1 md:inset-x-5 md:top-7">
                      <div className="flex gap-1"><span className="h-1.5 w-1.5 rounded-full bg-black/15" /><span className="h-1.5 w-1.5 rounded-full bg-black/15" /><span className="h-1.5 w-1.5 rounded-full bg-black/15" /></div>
                      <div className="mt-2 h-1.5 w-1/2 rounded bg-black/15" />
                      <div className="mt-1.5 h-1.5 w-3/4 rounded bg-black/10" />
                      <div className="mt-2 hidden grid-cols-3 gap-1.5 md:grid"><div className="h-6 rounded bg-black/5" /><div className="h-6 rounded bg-black/5" /><div className="h-6 rounded bg-black/5" /></div>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-[14px] font-semibold md:text-[15px]">{p.name}</h3>
                      {p.published ? <Badge tone="green">Live</Badge> : <Badge className="hidden sm:inline-flex">Draft</Badge>}
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[11.5px] text-fg-3">
                      <span className="flex items-center gap-1"><Icon className="h-3.5 w-3.5" /> {p.category}</span>
                      <span className="hidden items-center gap-1 sm:flex"><Clock className="h-3.5 w-3.5" /> {timeAgo(p.updatedAt)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
