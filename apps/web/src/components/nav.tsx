import Link from "next/link";

import { DownloadButton, Logo } from "./brand";
import { IconMenu } from "./icons";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#analysis", label: "Analysis" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/#faq", label: "FAQ" },
];

/** Slim white nav bar. Below the tablet breakpoint the links fold into a menu (no JavaScript needed). */
export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="t-body-sm text-ink-secondary transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <DownloadButton tone="utility" />
        </div>

        <details className="group relative md:hidden">
          <summary
            className="grid size-10 cursor-pointer list-none place-items-center rounded-md border border-hairline bg-surface [&::-webkit-details-marker]:hidden"
            aria-label="Menu">
            <IconMenu size={20} />
          </summary>
          <div className="absolute right-0 top-12 w-60 rounded-lg border border-hairline bg-surface p-2 shadow-elevated">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-sm px-3 py-2.5 text-[15px] hover:bg-canvas-soft">
                {l.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-hairline px-1 pt-2">
              <DownloadButton tone="utility" />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
