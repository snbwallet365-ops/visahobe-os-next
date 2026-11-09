import { AppShell, type NavItem } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, c] = await Promise.all([requireAdmin(), getContent()]);
  const nav: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "overview", exact: true },
    { href: "/admin/assistant", label: "AI Assistant", icon: "assistant", badge: "AI" },
    { href: "/admin/content", label: "Content", icon: "content" },
    { href: "/admin/theme", label: "Theme", icon: "theme" },
    { href: "/admin/users", label: "Users", icon: "users" },
  ];
  const extra: NavItem[] = [
    { href: "/", label: "View live site", icon: "site" },
    { href: "/dashboard", label: "User dashboard", icon: "projects" },
  ];
  return (
    <AppShell mode="admin" brand={c["brand.name"]} nav={nav} extra={extra} homeHref="/admin" user={{ name: user.name, email: user.email, plan: user.plan, role: user.role }}>
      {children}
    </AppShell>
  );
}
