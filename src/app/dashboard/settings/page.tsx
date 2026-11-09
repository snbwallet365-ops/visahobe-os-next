import { Check } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { rotateApiKeyAction } from "@/app/actions/dashboard";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/input";

export const dynamic = "force-dynamic";

const PLANS = [
  { id: "free", name: "Free", price: "$0", credits: "25 message credits", features: ["Unlimited apps", "Built-in backend", "Free subdomain"] },
  { id: "starter", name: "Starter", price: "$16", credits: "100 message credits", features: ["Custom domain", "1 Superagent", "Email support"] },
  { id: "builder", name: "Builder", price: "$40", credits: "250 message credits", features: ["SEO/GEO dashboard", "5 Superagents 24/7", "GitHub sync"] },
  { id: "pro", name: "Pro", price: "$80", credits: "500 message credits", features: ["Unlimited Superagents", "Team seats", "Priority support"] },
];

export default async function SettingsPage() {
  const user = await requireUser();
  const masked = `${user.apiKey.slice(0, 8)}${"•".repeat(20)}${user.apiKey.slice(-4)}`;

  return (
    <div className="min-h-[100dvh] bg-page">
      <PageHeader title="Settings" description="Manage your account, API access and billing." />
      <div className="mx-auto max-w-[1000px] space-y-6 px-4 py-6 md:px-10 md:py-8">
        <Card className="p-6">
          <div className="text-[15px] font-semibold">Profile</div>
          <ProfileForm name={user.name} email={user.email} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold">API key &amp; SDK</div>
              <p className="mt-1 text-[13px] text-fg-3">Use with the SDK and CLI to sync schemas and run agents from your own code.</p>
            </div>
            <form action={rotateApiKeyAction}><Button variant="secondary" size="sm">Rotate key</Button></form>
          </div>
          <div className="mt-4 rounded-btn border border-line bg-panel px-3.5 py-3 font-mono text-[13px] text-fg-2">{masked}</div>
          <pre className="scrollbar-thin mt-4 overflow-x-auto rounded-btn border border-line bg-panel p-4 font-mono text-[12px] leading-relaxed text-fg-2">{`npm install @base44/sdk

import { createClient } from "@base44/sdk";

const client = createClient({ appId: "your-app-id" });
const orders = await client.entities.Order.filter({ status: "pending" });

# CLI
npx base44 login
npx base44 entities push`}</pre>
        </Card>

        <Card id="billing" className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-semibold">Plan &amp; billing</div>
            <Badge tone="accent" className="capitalize">Current: {user.plan}</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => {
              const current = p.id === user.plan;
              return (
                <div key={p.id} className={`flex flex-col rounded-card border p-4 transition ${current ? "border-accent/50 bg-accent/5" : "border-line bg-panel/60 hover:border-line-strong"}`}>
                  <div className="text-[13px] font-medium text-fg-2">{p.name}</div>
                  <div className="mt-1 text-[26px] font-semibold">{p.price}<span className="text-[13px] font-normal text-fg-3">/mo</span></div>
                  <div className="text-[12px] text-fg-3">{p.credits}</div>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {p.features.map((f) => <li key={f} className="flex items-center gap-1.5 text-[12px] text-fg-2"><Check className="h-3 w-3 text-accent" />{f}</li>)}
                  </ul>
                  <Button size="sm" variant={current ? "secondary" : "primary"} disabled={current} className="mt-4 w-full">{current ? "Current plan" : "Upgrade"}</Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
