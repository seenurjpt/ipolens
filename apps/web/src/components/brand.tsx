import Link from "next/link";

import { getApk } from "@/lib/downloads";
import { site } from "@/lib/site";

import { IconDownload } from "./icons";

/** Wordmark: a black lens tile plus the name. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <span
        className={`grid size-8 place-items-center rounded-md ${inverted ? "bg-white text-secondary" : "bg-ink text-white"}`}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="2.2" />
          <path d="m15 15 4.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="m8 12 1.8-2 1.4 1.3L13.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className={`text-[19px] font-bold tracking-[-0.4px] ${inverted ? "text-white" : "text-ink"}`}>
        {site.name}
      </span>
    </Link>
  );
}

/**
 * The main "get the app" action everywhere on the site. It goes to /download, the only official
 * source of the app (an Android APK).
 */
export function DownloadButton({ tone = "primary" }: { tone?: "primary" | "utility" }) {
  if (tone === "utility") {
    return (
      <Link href="/download/" className="btn-utility">
        <IconDownload size={16} /> Get the app
      </Link>
    );
  }
  return (
    <Link href="/download/" className="btn-primary px-6 text-[17px]">
      <IconDownload size={20} /> Download the app
    </Link>
  );
}

/** Direct APK download. Nothing until an APK is published (see lib/downloads.ts). */
export function ApkButton({ className = "btn-secondary" }: { className?: string }) {
  const apk = getApk();
  if (!apk) return null;
  const local = apk.url.startsWith("/");
  return (
    <a href={apk.url} className={className} {...(local ? { download: "" } : { rel: "noopener" })}>
      <IconDownload size={20} /> Download APK
      {apk.version ? <span className="font-normal opacity-75">v{apk.version}</span> : null}
    </a>
  );
}

/** Shown in place of store buttons that aren't live yet. */
export function ComingSoon({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-12 items-center gap-2 rounded-full border border-dashed border-ink-faint/60 px-5 text-[15px] font-medium text-ink-muted">
      <span className="size-1.5 rounded-full bg-sticker-orange" aria-hidden="true" /> {label}
    </span>
  );
}

/** Eyebrow / category pill (badge-pill). */
export function Badge({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "night" }) {
  return (
    <span
      className={`t-eyebrow inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
        tone === "night" ? "bg-white/12 text-white ring-1 ring-white/20" : "bg-surface text-primary shadow-soft"
      }`}>
      {children}
    </span>
  );
}

const STICKER = {
  sky: "bg-sticker-sky",
  green: "bg-sticker-green",
  purple: "bg-sticker-purple text-sticker-purple-deep",
  orange: "bg-sticker-orange",
  pink: "bg-sticker-pink",
  teal: "bg-sticker-teal",
} as const;

export type StickerColor = keyof typeof STICKER;

/** A small colour "sticker" tile holding an icon. Decoration only (DESIGN-notion.md > sticker palette). */
export function Sticker({ color, children }: { color: StickerColor; children: React.ReactNode }) {
  return (
    <span className={`grid size-10 place-items-center rounded-lg text-white ${STICKER[color]}`} aria-hidden="true">
      {children}
    </span>
  );
}
