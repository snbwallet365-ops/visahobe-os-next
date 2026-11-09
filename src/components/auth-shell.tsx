import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export function AuthShell({ children, brand }: { children: React.ReactNode; brand: string }) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-page">
      <div className="dot-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" />
      <div className="hero-glow pointer-events-none absolute left-1/2 top-1/4 h-[340px] w-[700px] max-w-[150vw] -translate-x-1/2 opacity-50" />
      <header className="relative flex h-14 items-center justify-between px-4 md:h-16 md:px-8">
        <Logo name={brand} />
        <Link href="/" className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] text-fg-2 transition hover:bg-panel hover:text-fg">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </header>
      <main className="relative flex flex-1 items-start justify-center px-4 pb-10 pt-4 sm:items-center">{children}</main>
    </div>
  );
}
