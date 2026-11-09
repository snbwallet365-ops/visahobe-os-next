import Link from "next/link";
import {
  ArrowRight, Bot, Check, CreditCard, Database, FileText, Globe2, HardDrive, Lock, Mail, MessageCircle, Plug, Search, Sparkles, Zap,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { PromptBox } from "@/components/landing/prompt-box";
import { Showcase } from "@/components/landing/showcase";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { lines } from "@/lib/site-fields";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";

export const dynamic = "force-dynamic";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-[12px] font-medium text-fg-2 shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[44px]">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-fg-2 md:text-[17px]">{sub}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, children }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="group rounded-card border border-line bg-card p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-float md:p-6">
      <div className="grid h-10 w-10 place-items-center rounded-btn bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-[18px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-fg-2">{desc}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

const INTEGRATIONS = [
  { name: "Stripe", icon: CreditCard, color: "#635BFF" },
  { name: "Gmail", icon: Mail, color: "#EA4335" },
  { name: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  { name: "Slack", icon: Zap, color: "#E01E5A" },
  { name: "Notion", icon: FileText, color: "#111111" },
  { name: "OpenAI", icon: Sparkles, color: "#10A37F" },
];

export default async function HomePage() {
  const [user, c] = await Promise.all([getCurrentUser(), getContent()]);
  const domain = c["brand.name"].toLowerCase().replace(/[^a-z0-9]+/g, "");
  const authed = !!user;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-page">
      <Header loggedIn={authed} isAdmin={user?.role === "admin"} c={c} />

      {/* HERO */}
      <section className="relative pb-14 pt-28 md:pb-20 md:pt-40">
        <div className="dot-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_65%)]" />
        <div className="hero-glow animate-blob pointer-events-none absolute left-1/2 top-16 h-[380px] w-[900px] max-w-[160vw] -translate-x-1/2 opacity-70" />
        <div className="relative mx-auto max-w-[820px] px-4 text-center">
          <Link href="#superagents" className="animate-rise inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-card/80 py-1 pl-1 pr-3 text-[13px] text-fg-2 shadow-sm backdrop-blur transition hover:text-fg">
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">{c["hero.badgeTag"]}</span>
            <span className="truncate">{c["hero.badge"]}</span> <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </Link>
          <h1 className="animate-rise mt-6 text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] [animation-delay:60ms] md:text-[76px]">{c["hero.title"]}</h1>
          <p className="animate-rise mx-auto mt-5 max-w-[600px] text-[16px] leading-relaxed text-fg-2 [animation-delay:120ms] md:text-[19px]">{c["hero.subtitle"]}</p>
          <div className="animate-rise mx-auto mt-8 max-w-[700px] text-left [animation-delay:180ms] md:mt-10">
            <PromptBox c={c} />
          </div>
          <p className="mt-5 text-[13px] text-fg-3">{c["hero.trust"]}</p>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="relative mx-auto max-w-[1200px] px-4 pb-20 md:px-8 md:pb-28">
        <Showcase c={c} domain={domain} />
      </section>

      {/* FEATURES */}
      <section id="features" className="relative scroll-mt-16 border-t border-line bg-panel py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <SectionHeading eyebrow={c["features.eyebrow"]} title={c["features.title"]} sub={c["features.subtitle"]} />
          <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
            <FeatureCard icon={Database} title={c["features.f1Title"]} desc={c["features.f1Desc"]}>
              <div className="overflow-hidden rounded-btn border border-line font-mono text-[12px]">
                <div className="flex items-center justify-between border-b border-line bg-panel px-3 py-2 text-fg-3">
                  <span>entities / Order</span>
                  <span className="flex items-center gap-1 text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />synced</span>
                </div>
                {[["id", "uuid", "primary"], ["customer", "ref → User", "required"], ["total", "number", "currency"], ["status", "enum", "pending | paid"]].map(([k, t, n]) => (
                  <div key={k} className="grid grid-cols-3 border-b border-line px-3 py-2 last:border-0">
                    <span className="text-fg">{k}</span>
                    <span className="text-accent">{t}</span>
                    <span className="truncate text-fg-3">{n}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[{ i: Lock, t: "Auth" }, { i: HardDrive, t: "Storage" }, { i: Zap, t: "Functions" }].map(({ i: I, t }) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[12px] text-fg-2"><I className="h-3 w-3" /> {t}</span>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard icon={Plug} title={c["features.f2Title"]} desc={c["features.f2Desc"]}>
              <div className="grid grid-cols-3 gap-2">
                {INTEGRATIONS.map(({ name, icon: I, color }) => (
                  <div key={name} className="flex flex-col items-center gap-2 rounded-btn border border-line bg-panel/60 py-3.5 transition hover:bg-card">
                    <span className="grid h-9 w-9 place-items-center rounded-btn" style={{ background: `${color}14`, color }}>
                      <I className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-[12px] text-fg-2">{name}</span>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard icon={Search} title={c["features.f3Title"]} desc={c["features.f3Desc"]}>
              <div className="grid grid-cols-3 gap-2">
                {[{ k: "SEO score", v: "94", cl: "text-emerald-600" }, { k: "AI citations", v: "1.2k", cl: "text-accent" }, { k: "Indexed", v: "128", cl: "text-fg" }].map((m) => (
                  <div key={m.k} className="rounded-btn border border-line bg-panel/60 p-3">
                    <div className={`text-[20px] font-semibold ${m.cl}`}>{m.v}</div>
                    <div className="text-[11px] text-fg-3">{m.k}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 space-y-2">
                {[{ q: "best bakery crm", p: 3, w: "88%" }, { q: "loyalty app for cafes", p: 5, w: "70%" }].map((r) => (
                  <div key={r.q} className="flex items-center gap-3 rounded-btn border border-line px-3 py-2 text-[12px]">
                    <Globe2 className="h-3.5 w-3.5 text-fg-3" />
                    <span className="flex-1 truncate text-fg-2">{r.q}</span>
                    <span className="h-1 w-14 overflow-hidden rounded-full bg-fg/5"><span className="block h-full bg-accent" style={{ width: r.w }} /></span>
                    <span className="w-7 text-right font-medium">#{r.p}</span>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard icon={Bot} title={c["features.f4Title"]} desc={c["features.f4Desc"]}>
              <div className="space-y-2 rounded-btn border border-line bg-[#efeae2] p-3">
                <div className="flex items-center gap-2 text-[12px] text-zinc-600"><MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> WhatsApp · Support agent <span className="ml-auto flex items-center gap-1 text-emerald-700"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />live</span></div>
                <div className="max-w-[80%] rounded-[10px] rounded-tl-sm bg-white px-3 py-2 text-[13px] text-zinc-800 shadow-sm">Hi! Where is my order #48213?</div>
                <div className="ml-auto max-w-[80%] rounded-[10px] rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-[13px] text-zinc-800 shadow-sm">Order #48213 is out for delivery today 📦</div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600"><Check className="h-3 w-3 text-emerald-600" /> Ran tool: lookup_order</div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* SUPERAGENTS */}
      <section id="superagents" className="relative scroll-mt-16 overflow-hidden border-t border-line py-20 md:py-28">
        <div className="hero-glow pointer-events-none absolute -right-40 top-10 h-80 w-[600px] opacity-40" />
        <div className="relative mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <Eyebrow>{c["sa.eyebrow"]}</Eyebrow>
              <h2 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[44px]">{c["sa.title"]}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-fg-2 md:text-[16px]">{c["sa.desc"]}</p>
              <ul className="mt-6 space-y-3">
                {lines(c["sa.bullets"]).map((t) => (
                  <li key={t} className="flex items-center gap-3 text-[15px] text-fg-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><Check className="h-3 w-3" /></span>
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/agents/new?template=whatsapp_support" className={buttonVariants({ variant: "dark", size: "lg", className: "mt-8 w-full rounded-full sm:w-auto" })}>
                {c["sa.cta"]} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <div className="mb-3 text-[13px] font-medium text-fg-2">{c["sa.templatesTitle"]}</div>
              <div className="grid grid-cols-2 gap-3">
                {AGENT_TEMPLATES.map((t) => (
                  <Link
                    key={t.id}
                    href={`/agents/new?template=${t.id}`}
                    className="group flex flex-col rounded-card border border-line bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-float active:scale-[0.98]"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-btn bg-panel text-[20px]">{t.emoji}</span>
                    <span className="mt-3 text-[14.5px] font-semibold">{c[`${t.contentKey}Title`]}</span>
                    <span className="mt-1 flex-1 text-[12.5px] leading-snug text-fg-3">{c[`${t.contentKey}Desc`]}</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent">Use template <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-16 border-t border-line bg-panel py-20 md:py-28">
        <div className="mx-auto max-w-[960px] px-4 md:px-8">
          <SectionHeading eyebrow={c["pricing.eyebrow"]} title={c["pricing.title"]} sub={c["pricing.subtitle"]} />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-card border border-line bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:p-8">
              <div className="text-[15px] font-medium text-fg-2">{c["pricing.freeName"]}</div>
              <div className="mt-2 flex items-baseline gap-1"><span className="text-[46px] font-semibold tracking-tight">{c["pricing.freePrice"]}</span><span className="text-fg-3">{c["pricing.period"]}</span></div>
              <p className="mt-1 text-[14px] text-fg-2">{c["pricing.freeDesc"]}</p>
              <ul className="mt-6 flex-1 space-y-3 text-[14px] text-fg-2">
                {lines(c["pricing.freeFeatures"]).map((x) => <li key={x} className="flex items-center gap-2.5"><Check className="h-4 w-4 text-fg-3" />{x}</li>)}
              </ul>
              <Link href={authed ? "/dashboard" : "/signup"} className={buttonVariants({ variant: "secondary", size: "lg", className: "mt-8 w-full rounded-full" })}>{c["pricing.freeCta"]}</Link>
            </div>
            <div className="relative flex flex-col overflow-hidden rounded-card border-2 border-accent bg-card p-6 shadow-float md:p-8">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-medium text-fg-2">{c["pricing.paidName"]}</div>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-white">{c["pricing.paidBadge"]}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1"><span className="text-[14px] text-fg-3">{c["pricing.paidFrom"]}</span><span className="text-[46px] font-semibold tracking-tight">{c["pricing.paidPrice"]}</span><span className="text-fg-3">{c["pricing.period"]}</span></div>
              <p className="mt-1 text-[14px] text-fg-2">{c["pricing.paidDesc"]}</p>
              <ul className="mt-6 flex-1 space-y-3 text-[14px] text-fg-2">
                {lines(c["pricing.paidFeatures"]).map((x) => <li key={x} className="flex items-center gap-2.5"><Check className="h-4 w-4 text-accent" />{x}</li>)}
              </ul>
              <Link href={authed ? "/dashboard/settings#billing" : "/signup"} className={buttonVariants({ variant: "primary", size: "lg", className: "mt-8 w-full rounded-full" })}>{c["pricing.paidCta"]}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-line py-20 md:py-24">
        <div className="hero-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <div className="relative mx-auto max-w-[720px] px-4 text-center">
          <h2 className="text-[30px] font-semibold tracking-[-0.03em] md:text-[44px]">{c["cta.title"]}</h2>
          <div className="mt-7 text-left"><PromptBox c={c} compact /></div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line pb-24 pt-12 md:pb-12">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-4 md:grid-cols-5 md:px-8">
          <div className="col-span-2">
            <Logo name={c["brand.name"]} />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-fg-3">{c["footer.tagline"]}</p>
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <div className="text-[13px] font-semibold">{c[`footer.col${n}Title`]}</div>
              <ul className="mt-3 space-y-2">
                {lines(c[`footer.col${n}Links`]).map((x) => (
                  <li key={x}><a href="#" className="text-[13px] text-fg-3 transition hover:text-fg">{x}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-[1200px] flex-col justify-between gap-2 border-t border-line px-4 pt-6 text-[12px] text-fg-3 md:flex-row md:px-8">
          <span>{c["footer.copyright"]}</span>
          <span>{c["footer.note"]}</span>
        </div>
      </footer>

      {/* Mobile sticky CTA (app-like) */}
      {!authed && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page/90 p-3 backdrop-blur-xl md:hidden">
          <Link href="/signup" className={buttonVariants({ variant: "primary", size: "lg", className: "w-full rounded-full" })}>
            {c["nav.cta"]} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
