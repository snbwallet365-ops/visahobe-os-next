import Link from "next/link";
import { eq } from "drizzle-orm";
import { Calendar, CreditCard, FileText, Image as ImageIcon, Mail, MessageCircle, Sheet, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { toggleIntegrationAction } from "@/app/actions/dashboard";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/input";

export const dynamic = "force-dynamic";

const CATALOG: { id: string; name: string; desc: string; icon: LucideIcon; color: string; category: string; builtIn?: boolean }[] = [
  { id: "whatsapp", name: "WhatsApp Business", desc: "Receive and send messages with Superagents via the Cloud API.", icon: MessageCircle, color: "#25D366", category: "Messaging" },
  { id: "stripe", name: "Stripe", desc: "Accept payments, subscriptions and checkout links.", icon: CreditCard, color: "#635BFF", category: "Payments" },
  { id: "email", name: "Email", desc: "Send transactional emails from your app. Built in.", icon: Mail, color: "#F05A28", category: "Core", builtIn: true },
  { id: "llm", name: "AI / LLM", desc: "Invoke language models for text, JSON and vision. Built in.", icon: Sparkles, color: "#10A37F", category: "Core", builtIn: true },
  { id: "image", name: "Image generation", desc: "Generate images from prompts inside your app.", icon: ImageIcon, color: "#ec4899", category: "Core", builtIn: true },
  { id: "slack", name: "Slack", desc: "Post notifications and escalations to channels.", icon: Zap, color: "#E01E5A", category: "Messaging" },
  { id: "gcal", name: "Google Calendar", desc: "Create events when Superagents book appointments.", icon: Calendar, color: "#4285F4", category: "Productivity" },
  { id: "gsheets", name: "Google Sheets", desc: "Sync entities to spreadsheets automatically.", icon: Sheet, color: "#0F9D58", category: "Productivity" },
  { id: "notion", name: "Notion", desc: "Read and write pages and databases.", icon: FileText, color: "#111111", category: "Productivity" },
];

export default async function IntegrationsPage() {
  const user = await requireUser();
  const rows = await db.select().from(integrations).where(eq(integrations.userId, user.id));
  const connected = new Set(rows.map((r) => r.provider));

  return (
    <div className="min-h-[100dvh] bg-page">
      <PageHeader title="Integrations" description="One-click connections for every app and Superagent in your workspace." />
      <div className="mx-auto grid max-w-[1200px] gap-4 px-6 py-8 sm:grid-cols-2 md:px-10 lg:grid-cols-3">
        {CATALOG.map((it) => {
          const on = it.builtIn || connected.has(it.id);
          const Icon = it.icon;
          return (
            <div key={it.id} className="group flex flex-col rounded-card border border-line bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-btn" style={{ background: `${it.color}14`, color: it.color === "#ffffff" ? "#111" : it.color }}>
                  <Icon className="h-5 w-5" />
                </span>
                {it.builtIn ? <Badge tone="accent">Built in</Badge> : on ? <Badge tone="green">Connected</Badge> : <Badge>{it.category}</Badge>}
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{it.name}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-fg-3">{it.desc}</p>
              <div className="mt-5 flex gap-2">
                {it.builtIn ? (
                  <Button variant="secondary" size="sm" disabled className="w-full">Always on</Button>
                ) : (
                  <form action={toggleIntegrationAction.bind(null, it.id)} className="flex-1">
                    <Button variant={on ? "secondary" : "primary"} size="sm" className="w-full">{on ? "Disconnect" : "Connect"}</Button>
                  </form>
                )}
                {it.id === "whatsapp" && (
                  <Link href="/dashboard/superagents" className="inline-flex h-8 items-center rounded-btn border border-line px-3 text-[13px] text-fg-2 transition hover:border-line-strong hover:text-fg">Configure</Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
