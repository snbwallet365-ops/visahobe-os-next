"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateProfileAction } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="name">Display name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div>
        <Label>Email</Label>
        <Input value={email} disabled className="opacity-60" />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save changes</Button>
        {state?.ok && <span className="flex items-center gap-1 text-[13px] text-emerald-600"><Check className="h-3.5 w-3.5" />Saved</span>}
        {state?.error && <span className="text-[13px] text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}
