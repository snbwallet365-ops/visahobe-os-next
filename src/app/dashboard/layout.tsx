import { AppShell, type NavItem } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, c] = await Promise.all([requireUser(), getContent()]);
  const nav: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: "projects", exact: true, matches: ["/dashboard/projects"] },
    { href: "/dashboard/superagents", label: "Superagents", icon: "agents", badge: "NEW" },
    { href: "/dashboard/integrations", label: "Integrations", icon: "integrations" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "analytics" },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  ];
  const extra: NavItem[] = user.role === "admin" ? [{ href: "/admin", label: "Admin panel", icon: "admin" }] : [];
  return (
    <AppShell
      mode="user"
      brand={c["brand.name"]}
      nav={nav}
      extra={extra}
      homeHref="/dashboard"
      user={{ name: user.name, email: user.email, plan: user.plan, role: user.role }}
      upgrade={user.plan === "free" ? { title: c["dash.upgradeTitle"], desc: c["dash.upgradeDesc"], cta: c["dash.upgradeCta"] } : null}
    >
      {children}
    </AppShell>
  );
}
