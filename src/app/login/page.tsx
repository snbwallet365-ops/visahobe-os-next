import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { DEFAULT_ADMIN_EMAIL, ensureAdmin, getCurrentUser, safeNext } from "@/lib/auth";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ prompt?: string; category?: string; next?: string; admin?: string }> }) {
  const { prompt, category, next, admin } = await searchParams;
  const nxt = safeNext(next);
  const user = await getCurrentUser();
  if (user) redirect(nxt || (user.role === "admin" ? "/admin" : "/dashboard"));
  await ensureAdmin();
  const c = await getContent();
  return (
    <AuthShell brand={c["brand.name"]}>
      <AuthForm
        mode="login"
        prompt={prompt}
        category={category}
        next={nxt}
        c={c}
        adminHint={admin !== undefined ? `Admin sign-in: ${DEFAULT_ADMIN_EMAIL}` : undefined}
      />
    </AuthShell>
  );
}
