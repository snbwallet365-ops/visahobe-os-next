import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ prompt?: string; category?: string; next?: string }> }) {
  const { prompt, category, next } = await searchParams;
  const nxt = safeNext(next);
  const user = await getCurrentUser();
  if (user) {
    if (prompt) redirect(`/start?${new URLSearchParams({ prompt, category: category ?? "Apps" }).toString()}`);
    redirect(nxt || "/dashboard");
  }
  const c = await getContent();
  return (
    <AuthShell brand={c["brand.name"]}>
      <AuthForm mode="signup" prompt={prompt} category={category} next={nxt} c={c} />
    </AuthShell>
  );
}
