import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import "server-only";

/**
 * The Android APK offered for direct download, read once at build time (the site is a static export).
 *
 * Two ways to publish one:
 * - Put the file in public/downloads/ named like `ipolens-1.2.0.apk`. The newest one is offered, and
 *   its size and SHA-256 checksum are computed here.
 * - Or host it elsewhere (e.g. GitHub Releases) and set NEXT_PUBLIC_APK_URL, with optional
 *   NEXT_PUBLIC_APK_VERSION and NEXT_PUBLIC_APK_SHA256 so visitors can still verify it.
 *
 * Returns null when there is no APK yet; the download page then says "Coming soon".
 */
export interface Apk {
  url: string;
  version: string | null;
  sizeMb: string | null;
  sha256: string | null;
}

/** Oldest Android the app supports (Expo SDK 57's minSdkVersion 24). */
export const MIN_ANDROID = "Android 7.0";

const env = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

function localApk(): Apk | null {
  const dir = join(process.cwd(), "public", "downloads");
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".apk"));
  } catch {
    return null; // no downloads folder
  }
  const newest = files
    .map((f) => ({ f, mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0]?.f;
  if (!newest) return null;

  const bytes = readFileSync(join(dir, newest));
  return {
    url: `/downloads/${encodeURIComponent(newest)}`,
    version: newest.match(/(\d+\.\d+\.\d+)/)?.[1] ?? null,
    sizeMb: (bytes.length / (1024 * 1024)).toFixed(1),
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

let cached: Apk | null | undefined;

export function getApk(): Apk | null {
  // Cache for the production build (hashing a large APK once is enough); in development re-read,
  // so dropping a new file into public/downloads shows up on the next page load.
  if (cached !== undefined && process.env.NODE_ENV === "production") return cached;
  const url = env(process.env.NEXT_PUBLIC_APK_URL);
  cached = url
    ? {
        url,
        version: env(process.env.NEXT_PUBLIC_APK_VERSION),
        sizeMb: null,
        sha256: env(process.env.NEXT_PUBLIC_APK_SHA256),
      }
    : localApk();
  return cached;
}
