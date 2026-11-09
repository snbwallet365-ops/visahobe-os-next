"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { loginAction, signupAction, ssoAction, type AuthState } from "@/app/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { LogoMark } from "@/components/logo";
import type { Content } from "@/lib/site-fields";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0023.5 12C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
      <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.1.1 2.3-.6 3.1-1.5z" />
    </svg>
  );
}

export function AuthForm({ mode, prompt, category, next, c, adminHint }: { mode: "signup" | "login"; prompt?: string; category?: string; next?: string; c: Content; adminHint?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(mode === "signup" ? signupAction : loginAction, undefined);
  const [ssoState, setSsoState] = useState<AuthState>();
  const [ssoPending, startSso] = useTransition();
  const [show, setShow] = useState(false);
  const prefix = mode === "signup" ? c["auth.ssoSignup"] : c["auth.ssoLogin"];

  const providers = [
    { id: "google", label: `${prefix} Google`, icon: <GoogleIcon /> },
    { id: "github", label: `${prefix} GitHub`, icon: <GitHubIcon /> },
    { id: "apple", label: `${prefix} Apple`, icon: <AppleIcon /> },
  ];

  const qs = new URLSearchParams();
  if (prompt) qs.set("prompt", prompt);
  if (category) qs.set("category", category);
  if (next) qs.set("next", next);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  return (
    <div className="animate-rise w-full max-w-[400px]">
      <div className="shadow-float rounded-[calc(var(--radius-card)+4px)] border border-line bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-10 w-10" />
          <h1 className="mt-4 text-[24px] font-semibold tracking-[-0.02em]">{mode === "signup" ? c["auth.signupTitle"] : c["auth.loginTitle"]}</h1>
          <p className="mt-1 text-[14px] text-fg-2">{mode === "signup" ? c["auth.signupSubtitle"] : c["auth.loginSubtitle"]}</p>
        </div>

        {prompt && (
          <div className="mt-5 rounded-btn border border-accent/20 bg-accent/5 px-3.5 py-2.5 text-[13px] text-fg-2">
            <span className="font-medium text-accent">Your idea: </span>
            <span className="line-clamp-2">{prompt}</span>
          </div>
        )}

        <div className="mt-6 grid gap-2.5">
          {providers.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={ssoPending}
              onClick={() => startSso(async () => setSsoState(await ssoAction(p.id)))}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-btn border border-line bg-card text-[14px] font-medium text-fg shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-panel active:scale-[0.98] disabled:opacity-60"
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>

        {ssoState?.info && (
          <div className="mt-3 flex gap-2 rounded-btn border border-line bg-panel px-3 py-2.5 text-[12.5px] text-fg-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> {ssoState.info}
          </div>
        )}

        <div className="my-5 flex items-center gap-3 text-[12px] text-fg-3">
          <span className="h-px flex-1 bg-line" /> {c["auth.or"]} <span className="h-px flex-1 bg-line" />
        </div>

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="prompt" value={prompt ?? ""} />
          <input type="hidden" name="category" value={category ?? "Apps"} />
          <input type="hidden" name="next" value={next ?? ""} />
          <div>
            <Label htmlFor="email">{c["auth.email"]}</Label>
            <Input id="email" name="email" type="email" inputMode="email" required autoComplete="email" placeholder={c["auth.emailPlaceholder"]} />
          </div>
          <div>
            <Label htmlFor="password">{c["auth.password"]}</Label>
            <div className="relative">
              <Input id="password" name="password" type={show ? "text" : "password"} required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="••••••••" className="pr-10" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-fg-3 hover:text-fg" aria-label="Toggle password">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {state?.error && <p className="rounded-btn border border-red-100 bg-red-50 px-3 py-2 text-[13px] text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-btn bg-accent text-[14.5px] font-semibold text-white transition hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} {mode === "signup" ? c["auth.signupButton"] : c["auth.loginButton"]}
          </button>
        </form>

        <p className="mt-6 text-center text-[13.5px] text-fg-2">
          {mode === "signup" ? (
            <>{c["auth.haveAccount"]} <Link href={`/login${suffix}`} className="font-semibold text-accent hover:underline">{c["auth.loginLink"]}</Link></>
          ) : (
            <>{c["auth.noAccount"]} <Link href={`/signup${suffix}`} className="font-semibold text-accent hover:underline">{c["auth.signupLink"]}</Link></>
          )}
        </p>
        {adminHint && <p className="mt-3 rounded-btn bg-panel px-3 py-2 text-center text-[12px] text-fg-3">{adminHint}</p>}
      </div>
      <p className="mt-5 px-4 text-center text-[12px] leading-relaxed text-fg-3">{c["auth.terms"]}</p>
    </div>
  );
}
