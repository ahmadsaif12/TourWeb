import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "HamroTour | Extraordinary stays",
  description: "Travel marketplace rebuilt with Django, Next.js, S3 media storage, and seeded demo listings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <div className="page-surface">
          <SiteHeader />
          <main className="site-shell page-content">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
