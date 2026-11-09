import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Bot, FileText, FolderKanban, MessageCircle, Palette, Sparkles, Undo2, Users } from "lucide-react";
import { db } from "@/db";
import { agentMessages, projects, siteContent, siteContentHistory, superagents, users } from "@/db/schema";
import { adminDeleteProjectAction, adminToggleAgentAction, undoContentAction } from "@/app/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/input";
import { FIELDS } from "@/lib/site-fields";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [[u], [p], [a], [m], [o], history, recentUsers, recentProjects, agents] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(projects),
    db.select({ n: count() }).from(superagents),
    db.select({ n: count() }).from(agentMessages),
    db.select({ n: count() }).from(siteContent),
    db.select().from(siteContentHistory).orderBy(desc(siteContentHistory.id)).limit(6),
    db.select().from(users).orderBy(desc(users.createdAt)).limit(5),
    db.select({ id: projects.id, name: projects.name, category: projects.category, published: projects.published, createdAt: projects.createdAt, owner: users.email }).from(projects).innerJoin(users, eq(users.id, projects.userId)).orderBy(desc(projects.createdAt)).limit(8),
    db.select({ id: superagents.id, name: superagents.name, status: superagents.status, owner: users.email }).from(superagents).innerJoin(users, eq(users.id, superagents.userId)).orderBy(desc(superagents.createdAt)).limit(8),
  ]);

  const stats = [
    { label: "Users", value: u.n, icon: Users, href: "/admin/users" },
    { label: "Projects", value: p.n, icon: FolderKanban, href: "#projects" },
    { label: "Superagents", value: a.n, icon: Bot, href: "#agents" },
    { label: "Agent messages", value: m.n, icon: MessageCircle, href: "#agents" },
  ];

  return (
    <div className="min-h-[100dvh] bg-page">
      <PageHeader title="Admin overview" description="Control every letter, color and user of your platform." />
      <div className="mx-auto max-w-[1160px] space-y-6 px-4 py-6 md:px-10 md:py-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, href }) => (
            <Link key={label} href={href} className="rounded-card border border-line bg-card p-4 transition hover:shadow-float md:p-5">
              <div className="flex items-center justify-between text-[12.5px] text-fg-3">{label}<Icon className="h-4 w-4" /></div>
              <div className="mt-2 text-[28px] font-semibold tracking-tight">{value.toLocaleString()}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/admin/assistant" className="group relative overflow-hidden rounded-card bg-primary p-5 text-primary-fg transition hover:opacity-95 active:scale-[0.99]">
            <div className="hero-glow pointer-events-none absolute -right-10 -top-10 h-40 w-60 opacity-60" />
            <Sparkles className="relative h-6 w-6 text-accent" />
            <div className="relative mt-3 text-[16px] font-semibold">AI Site Assistant</div>
            <p className="relative mt-1 text-[13px] opacity-70">Change any text or color by just typing a command.</p>
          </Link>
          <Link href="/admin/content" className="rounded-card border border-line bg-card p-5 transition hover:shadow-float active:scale-[0.99]">
            <FileText className="h-6 w-6 text-accent" />
            <div className="mt-3 text-[16px] font-semibold">Content editor</div>
            <p className="mt-1 text-[13px] text-fg-3">{FIELDS.length} editable fields · {o.n} customized</p>
          </Link>
          <Link href="/admin/theme" className="rounded-card border border-line bg-card p-5 transition hover:shadow-float active:scale-[0.99]">
            <Palette className="h-6 w-6 text-accent" />
            <div className="mt-3 text-[16px] font-semibold">Theme & colors</div>
            <p className="mt-1 text-[13px] text-fg-3">Presets, palette, font and corner radius.</p>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-semibold">Recent content changes</div>
              {history.length > 0 && (
                <form action={undoContentAction}><Button size="sm" variant="secondary"><Undo2 className="h-3.5 w-3.5" />Undo last</Button></form>
              )}
            </div>
            <div className="mt-3 divide-y divide-line">
              {history.length === 0 && <p className="py-4 text-[13px] text-fg-3">No changes yet. Try the AI Assistant!</p>}
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                  <span className="truncate text-fg-2">{h.summary}</span>
                  <span className="shrink-0 text-[12px] text-fg-3">{timeAgo(h.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-semibold">Newest users</div>
              <Link href="/admin/users" className="text-[13px] font-medium text-accent">Manage</Link>
            </div>
            <div className="mt-3 divide-y divide-line">
              {recentUsers.map((x) => (
                <div key={x.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-panel text-[12px] font-semibold uppercase">{x.name.slice(0, 2)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium">{x.email}</div>
                    <div className="text-[12px] text-fg-3">{timeAgo(x.createdAt)}</div>
                  </div>
                  <Badge tone={x.role === "admin" ? "dark" : "default"}>{x.role}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card id="projects" className="scroll-mt-20 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5 text-[15px] font-semibold">All projects</div>
          {recentProjects.length === 0 && <p className="px-5 py-6 text-[13px] text-fg-3">No projects yet.</p>}
          {recentProjects.map((x) => (
            <div key={x.id} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium">{x.name}</div>
                <div className="truncate text-[12px] text-fg-3">{x.owner} · {x.category} · {timeAgo(x.createdAt)}</div>
              </div>
              {x.published ? <Badge tone="green">Live</Badge> : <Badge>Draft</Badge>}
              <form action={adminDeleteProjectAction.bind(null, x.id)}><Button size="sm" variant="ghost" className="text-red-600">Delete</Button></form>
            </div>
          ))}
        </Card>

        <Card id="agents" className="scroll-mt-20 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5 text-[15px] font-semibold">All Superagents</div>
          {agents.length === 0 && <p className="px-5 py-6 text-[13px] text-fg-3">No Superagents yet.</p>}
          {agents.map((x) => (
            <div key={x.id} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium">{x.name}</div>
                <div className="truncate text-[12px] text-fg-3">{x.owner}</div>
              </div>
              <Badge tone={x.status === "active" ? "green" : "amber"}>{x.status}</Badge>
              <form action={adminToggleAgentAction.bind(null, x.id)}><Button size="sm" variant="secondary">{x.status === "active" ? "Pause" : "Resume"}</Button></form>
            </div>
          ))}
        </Card>

        <Link href="/" className={buttonVariants({ variant: "secondary", className: "w-full rounded-full md:hidden" })}>View live site</Link>
      </div>
    </div>
  );
}
