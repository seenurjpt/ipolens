import Link from "next/link";

import { site } from "@/lib/site";

import { Logo } from "./brand";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#analysis", label: "Analysis report" },
      { href: "/download/", label: "Download" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy/", label: "Privacy policy" },
      { href: "/privacy/#disclaimer", label: "Disclaimer" },
    ],
  },
];

/** Warm-paper footer with the link directory and the full disclaimer. */
export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas-soft">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="t-caption mt-4 text-ink-secondary">{site.description}</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="t-eyebrow text-ink-muted">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="t-caption text-ink-secondary hover:text-ink hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
              {col.title === "Legal" && site.contactEmail ? (
                <li>
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="t-caption text-ink-secondary hover:text-ink hover:underline">
                    Contact
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline">
        <div className="container-page space-y-2 py-8">
          <p className="t-caption max-w-4xl text-ink-muted">
            IPOLens is an information tool and does not provide investment advice. IPOLens is not registered with SEBI
            as a research analyst or investment adviser. Exchange data is shown as published by NSE and BSE and may be
            delayed. The analysis score summarises figures disclosed in each offer document and is not a rating or
            recommendation. Read the offer document and consult a registered adviser before investing.
          </p>
          <p className="t-caption text-ink-faint">
            © {new Date().getFullYear()} {site.name}.
          </p>
        </div>
      </div>
    </footer>
  );
}
