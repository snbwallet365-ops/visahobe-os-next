"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Bot, FileText, FolderKanban, Home, LayoutDashboard, LogOut, Palette, Plug, Settings, ShieldCheck, Sparkles, Users, ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  projects: FolderKanban, agents: Bot, integrations: Plug, analytics: BarChart3, settings: Settings, admin: ShieldCheck,
  overview: LayoutDashboard, assistant: Sparkles, content: FileText, theme: Palette, users: Users, home: Home, site: ExternalLink,
};

export type NavItem = { href: string; label: string; icon: string; exact?: boolean; badge?: string; mobile?: boolean; matches?: string[] };

export function AppShell({
  children, brand, nav, user, homeHref, extra, upgrade, mode,
}: {
  children: React.ReactNode;
  brand: string;
  nav: NavItem[];
  user: { name: string; email: string; plan: string; role: string };
  homeHref: string;
  extra?: NavItem[];
  upgrade?: { title: string; desc: string; cta: string } | null;
  mode: "user" | "admin";
}) {
  const pathname = usePathname();
  const isActive = (n: NavItem) =>
    n.exact ? pathname === n.href || (n.matches ?? []).some((m) => pathname.startsWith(m)) : pathname.startsWith(n.href);
  const mobileNav = nav.filter((n) => n.mobile !== false).slice(0, 5);
  const current = [...nav, ...(extra ?? [])].find(isActive);

  return (
    <div className="min-h-[100dvh] bg-panel">
      {/* Mobile top app bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-page/90 px-4 backdrop-blur-xl md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <Logo href={homeHref} name={brand} />
          {mode === "admin" && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-fg">ADMIN</span>}
        </div>
        <div className="flex items-center gap-1">
          {(extra ?? []).map((n) => {
            const Icon = ICONS[n.icon] ?? Home;
            return (
              <Link key={n.href} href={n.href} className="grid h-9 w-9 place-items-center rounded-full text-fg-2 hover:bg-panel" aria-label={n.label} title={n.label}>
                <Icon className="h-[18px] w-[18px]" />
              </Link>
            );
          })}
          <form action={logoutAction}>
            <button className="grid h-9 w-9 place-items-center rounded-full text-fg-2 hover:bg-panel" aria-label="Log out"><LogOut className="h-[18px] w-[18px]" /></button>
          </form>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-line bg-page md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Logo href={homeHref} name={brand} />
          {mode === "admin" && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-fg">ADMIN</span>}
        </div>
        <div className="px-3">
          <div className="flex items-center gap-2.5 rounded-card border border-line bg-panel/70 px-3 py-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-btn bg-accent text-[12px] font-semibold uppercase text-white">{user.name.slice(0, 1) || "V"}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{mode === "admin" ? "Admin console" : `${user.name}'s workspace`}</div>
              <div className="text-[11px] capitalize text-fg-3">{mode === "admin" ? "Full access" : `${user.plan} plan`}</div>
            </div>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3">
          {nav.map((n) => {
            const Icon = ICONS[n.icon] ?? Home;
            const active = isActive(n);
            return (
              <Link key={n.href} href={n.href} className={cn("group flex items-center gap-3 rounded-btn px-3 py-2 text-[14px] transition", active ? "bg-panel font-medium text-fg" : "text-fg-2 hover:bg-panel/70 hover:text-fg")}>
                <Icon className={cn("h-4 w-4", active ? "text-accent" : "text-fg-3 group-hover:text-fg-2")} />
                {n.label}
                {n.badge && <span className="ml-auto rounded-full bg-accent/10 px-1.5 py-px text-[10px] font-semibold text-accent">{n.badge}</span>}
              </Link>
            );
          })}
          {extra && extra.length > 0 && <div className="!my-3 h-px bg-line" />}
          {(extra ?? []).map((n) => {
            const Icon = ICONS[n.icon] ?? Home;
            return (
              <Link key={n.href} href={n.href} className="group flex items-center gap-3 rounded-btn px-3 py-2 text-[14px] text-fg-2 transition hover:bg-panel/70 hover:text-fg">
                <Icon className="h-4 w-4 text-fg-3" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 p-3">
          {upgrade && (
            <div className="rounded-card border border-accent/20 bg-gradient-to-b from-accent/10 to-transparent p-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold"><Sparkles className="h-4 w-4 text-accent" /> {upgrade.title}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-fg-2">{upgrade.desc}</p>
              <Link href="/dashboard/settings#billing" className="mt-3 flex h-8 items-center justify-center rounded-btn bg-accent text-[12.5px] font-semibold text-white transition hover:bg-accent-hover">{upgrade.cta}</Link>
            </div>
          )}
          <div className="flex items-center gap-2.5 rounded-card px-2 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-panel text-[12px] font-semibold uppercase">{user.name.slice(0, 2)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{user.name}</div>
              <div className="truncate text-[11px] text-fg-3">{user.email}</div>
            </div>
            <form action={logoutAction}>
              <button className="rounded-md p-1.5 text-fg-3 transition hover:bg-panel hover:text-fg" aria-label="Log out" title="Log out"><LogOut className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </aside>

      <div className="pb-[76px] md:pb-0 md:pl-[244px]">
        <span className="sr-only">{current?.label}</span>
        {children}
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page/95 backdrop-blur-xl md:hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${mobileNav.length}, minmax(0, 1fr))` }}>
          {mobileNav.map((n) => {
            const Icon = ICONS[n.icon] ?? Home;
            const active = isActive(n);
            return (
              <Link key={n.href} href={n.href} className={cn("flex h-[60px] flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition active:scale-95", active ? "text-accent" : "text-fg-3")}>
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition", active && "bg-accent/10")}>
                  <Icon className="h-[19px] w-[19px]" />
                </span>
                <span className="max-w-full truncate px-1">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
