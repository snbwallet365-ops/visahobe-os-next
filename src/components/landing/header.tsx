"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Content } from "@/lib/site-fields";

export function Header({ loggedIn, isAdmin, c }: { loggedIn: boolean; isAdmin: boolean; c: Content }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const NAV = [
    { label: c["nav.product"], href: "#features" },
    { label: c["nav.superagents"], href: "#superagents" },
    { label: c["nav.pricing"], href: "#pricing" },
    { label: c["nav.enterprise"], href: "#pricing" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled || open ? "border-b border-line bg-page/85 backdrop-blur-xl" : "border-b border-transparent")}>
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 md:h-16 md:px-8">
        <div className="flex items-center gap-8">
          <Logo name={c["brand.name"]} />
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map((n) => (
              <a key={n.label + n.href} href={n.href} className="rounded-full px-3 py-1.5 text-[14px] text-fg-2 transition hover:bg-panel hover:text-fg">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          {loggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin" className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}>
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className={buttonVariants({ variant: "primary", size: "sm", className: "h-9 rounded-full px-4" })}>
                {c["nav.dashboard"]}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden h-9 rounded-full sm:inline-flex" })}>
                {c["nav.login"]}
              </Link>
              <Link href="/signup" className={buttonVariants({ variant: "primary", size: "sm", className: "h-9 rounded-full px-4" })}>
                {c["nav.cta"]}
              </Link>
            </>
          )}
          <button className="ml-1 grid h-9 w-9 place-items-center rounded-full text-fg-2 hover:bg-panel md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="animate-rise border-t border-line bg-page px-4 pb-5 pt-2 md:hidden">
          {NAV.map((n) => (
            <a key={n.label + n.href} href={n.href} onClick={() => setOpen(false)} className="flex h-12 items-center border-b border-line text-[16px] font-medium text-fg">
              {n.label}
            </a>
          ))}
          {!loggedIn && (
            <Link href="/login" className={buttonVariants({ variant: "secondary", size: "lg", className: "mt-4 w-full rounded-full" })}>
              {c["nav.login"]}
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className={buttonVariants({ variant: "dark", size: "lg", className: "mt-4 w-full rounded-full" })}>
              Admin panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
