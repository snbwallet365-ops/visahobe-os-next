import { getCurrentUser } from "@/lib/auth";
import { createAgentFromTemplate } from "@/lib/agents";

export const dynamic = "force-dynamic";

function go(location: string) {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const template = url.searchParams.get("template") ?? "whatsapp_support";
  const user = await getCurrentUser();
  if (!user) return go(`/signup?next=${encodeURIComponent(`/agents/new?template=${template}`)}`);
  const id = await createAgentFromTemplate(user.id, template);
  return go(`/dashboard/superagents/${id}`);
}
