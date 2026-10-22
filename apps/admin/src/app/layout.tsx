import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { Nav, NavLinks } from "@/components/nav";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "IPOLens Admin", template: "%s · IPOLens Admin" },
  description: "Review IPO data and analysis reports, and run jobs.",
  robots: { index: false, follow: false },
};

// proxy.ts lets development run without a login; say so on every page. (Production refuses
// to serve without one, so the banner never applies there.)
const unprotected =
  process.env.NODE_ENV !== "production" && (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD);

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {unprotected ? (
          <div role="status" className="bg-under-soft px-4 py-1.5 text-center text-xs font-semibold text-under">
            Unprotected dev mode: set ADMIN_USER and ADMIN_PASSWORD to require a login.
          </div>
        ) : null}
        <div className="md:flex">
          <aside className="border-b border-line bg-surface px-4 py-3 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r md:py-6">
            <div className="flex items-center justify-between gap-4 md:block">
              <p className="px-3 text-lg font-bold tracking-tight md:mb-6">
                IPOLens <span className="font-medium text-muted">Admin</span>
              </p>
              {/* The active link depends on the URL, which streams in after the static shell. */}
              <Suspense fallback={<NavLinks />}>
                <Nav />
              </Suspense>
            </div>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
