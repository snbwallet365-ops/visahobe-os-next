import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getContent } from "@/lib/content";
import { fontHref, themeCss } from "@/lib/site-fields";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c["seo.title"],
    description: c["seo.description"],
    applicationName: c["brand.name"],
    appleWebApp: { capable: true, title: c["brand.name"], statusBarStyle: "default" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const c = await getContent();
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: c["theme.background"],
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const c = await getContent();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={fontHref(c)} />
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: themeCss(c) }} />
      </head>
      <body className="bg-page font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
