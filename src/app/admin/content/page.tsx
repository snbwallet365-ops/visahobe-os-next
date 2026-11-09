import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { readRawContent } from "@/lib/content";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  await requireAdmin();
  const raw = await readRawContent();
  return (
    <div className="min-h-[100dvh] bg-panel">
      <PageHeader
        title="Content editor"
        description="Every letter on the public site, sign-up pages and dashboard."
        actions={<Link href="/admin/assistant" className={buttonVariants({ variant: "dark", size: "sm", className: "rounded-full" })}><Sparkles className="h-3.5 w-3.5" />Ask AI instead</Link>}
      />
      <ContentEditor initial={raw} />
    </div>
  );
}
