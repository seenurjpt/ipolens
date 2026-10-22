"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/ipos", label: "IPOs" },
  { href: "/reports", label: "Reports" },
  { href: "/jobs", label: "Jobs" },
] as const;

/** Sidebar links (a top bar on tablets). With no path, nothing is highlighted. */
export function NavLinks({ pathname }: { pathname?: string }) {
  const active = (href: string) => (pathname === undefined ? false : href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <nav aria-label="Main" className="flex gap-1 md:flex-col">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active(l.href) ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            active(l.href) ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas hover:text-ink"
          }`}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

/** Reads the URL, so it must sit inside <Suspense> (see app/layout.tsx). */
export function Nav() {
  return <NavLinks pathname={usePathname()} />;
}
