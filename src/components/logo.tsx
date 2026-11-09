import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7 shrink-0", className)} aria-hidden>
      <circle cx="16" cy="16" r="15" style={{ fill: "var(--color-accent)" }} />
      <g style={{ fill: "var(--color-page)" }}>
        <rect x="0" y="17.2" width="32" height="2" />
        <rect x="0" y="21.6" width="32" height="2" />
        <rect x="0" y="26" width="32" height="2" />
      </g>
    </svg>
  );
}

export function Logo({ href = "/", name, className }: { href?: string; name: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)} aria-label={`${name} home`}>
      <LogoMark />
      <span className="text-[18px] font-semibold tracking-[-0.02em] text-fg">{name}</span>
    </Link>
  );
}
