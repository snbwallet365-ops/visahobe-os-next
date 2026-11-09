import { ArrowUpRight, BarChart3, LayoutGrid, ShoppingBag, Star, TrendingUp, Users } from "lucide-react";
import type { Content } from "@/lib/site-fields";
import { lines } from "@/lib/site-fields";

const bars = [38, 52, 44, 68, 58, 82, 74, 92, 70, 88, 96, 84];

function Window({ title, children, className = "", delay = 0 }: { title: string; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div style={{ animationDelay: `${delay}ms` }} className={`animate-rise shadow-float overflow-hidden rounded-card border border-line bg-card transition-transform duration-300 hover:-translate-y-1 ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-line bg-panel/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 truncate text-[12px] text-fg-3">{title}</span>
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}

export function Showcase({ c, domain }: { c: Content; domain: string }) {
  const icons = [Users, TrendingUp, ShoppingBag];
  const stats = lines(c["showcase.stats"]).slice(0, 3).map((l) => l.split("|"));
  return (
    <div className="relative grid gap-4 md:grid-cols-12">
      <Window title={`analytics.${domain}.app`} className="md:col-span-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] text-fg-3"><BarChart3 className="h-3.5 w-3.5" /> {c["showcase.analyticsTitle"]}</div>
            <div className="mt-1 text-[28px] font-semibold tracking-tight">{c["showcase.analyticsValue"]}</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600"><TrendingUp className="h-3 w-3" /> {c["showcase.analyticsChange"]}</div>
          </div>
          <div className="flex gap-0.5 rounded-full border border-line bg-panel p-0.5 text-[11px]">
            {["7d", "30d", "12m"].map((r, i) => (
              <span key={r} className={`rounded-full px-2.5 py-1 ${i === 2 ? "bg-card text-fg shadow-sm" : "text-fg-3"}`}>{r}</span>
            ))}
          </div>
        </div>
        <div className="mt-5 flex h-32 items-end gap-1.5 md:h-36 md:gap-2">
          {bars.map((h, i) => (
            <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-[4px] ${i === bars.length - 2 ? "bg-accent" : "bg-accent/15"}`} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 md:gap-3">
          {stats.map(([k, v], i) => {
            const Icon = icons[i] ?? Users;
            return (
              <div key={k + i} className="rounded-btn border border-line bg-panel/60 p-2.5 md:p-3">
                <Icon className="h-3.5 w-3.5 text-fg-3" />
                <div className="mt-1.5 text-[15px] font-semibold">{v}</div>
                <div className="truncate text-[11px] text-fg-3">{k}</div>
              </div>
            );
          })}
        </div>
      </Window>

      <div className="grid gap-4 md:col-span-5">
        <Window title={`widgets.${domain}.app`} delay={80}>
          <div className="mb-3 flex items-center gap-1.5 text-[12px] text-fg-3"><LayoutGrid className="h-3.5 w-3.5" /> {c["showcase.widgetsTitle"]}</div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-btn border border-line bg-panel/60 p-3">
              <div className="text-[11px] text-fg-3">Tasks done</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fg/5"><div className="h-full w-[72%] rounded-full bg-accent" /></div>
              <div className="mt-2 text-[13px] font-semibold">72%</div>
            </div>
            <div className="rounded-btn border border-line bg-panel/60 p-3">
              <div className="text-[11px] text-fg-3">Team</div>
              <div className="mt-2 flex -space-x-2">
                {["var(--color-accent)", "#a78bfa", "#34d399", "#60a5fa"].map((col) => (
                  <span key={col} className="h-6 w-6 rounded-full border-2 border-card" style={{ background: col }} />
                ))}
              </div>
              <div className="mt-2 text-[13px] font-semibold">4 online</div>
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-btn border border-line bg-panel/60 p-3">
              <div>
                <div className="text-[11px] text-fg-3">Next meeting</div>
                <div className="text-[13px] font-semibold">{c["showcase.meeting"]}</div>
              </div>
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-500" />
            </div>
          </div>
        </Window>

        <Window title={`shop.${domain}.app`} delay={160}>
          <div className="flex gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-btn bg-gradient-to-br from-g1 via-accent/70 to-g2">
              <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/90" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-fg-3">{c["showcase.productLabel"]}</div>
              <div className="truncate text-[15px] font-semibold">{c["showcase.productName"]}</div>
              <div className="mt-1 flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                <span className="ml-1 text-[11px] text-fg-3">(212)</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[17px] font-semibold">{c["showcase.productPrice"]}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[12px] font-medium text-primary-fg">{c["showcase.productCta"]} <ArrowUpRight className="h-3 w-3" /></span>
              </div>
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
}
