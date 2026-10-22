import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// The monorepo keeps one .env at its root (NEXT_PUBLIC_PLAY_STORE_URL, ...). Next only reads
// .env files in this app's folder, so load the root one as well. Variables already set win.
const rootEnv = join(process.cwd(), "..", "..", ".env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  // A static marketing site: `next build` writes plain HTML/CSS/JS to out/, ready for any static host.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
