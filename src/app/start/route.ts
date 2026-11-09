import { getCurrentUser } from "@/lib/auth";
import { createProjectForUser } from "@/lib/projects";

export const dynamic = "force-dynamic";

function go(location: string) {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const prompt = (url.searchParams.get("prompt") ?? "").trim();
  const category = url.searchParams.get("category") ?? "Apps";
  const user = await getCurrentUser();
  if (!user) {
    const qs = new URLSearchParams();
    if (prompt) qs.set("prompt", prompt);
    qs.set("category", category);
    return go(`/signup?${qs.toString()}`);
  }
  if (!prompt) return go("/dashboard");
  const id = await createProjectForUser(user.id, prompt.slice(0, 2000), category);
  return go(`/dashboard/projects/${id}`);
}
