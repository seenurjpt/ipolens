import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// The monorepo keeps one .env at its root (API_URL, ADMIN_API_TOKEN, ADMIN_USER, ...).
// Next only reads .env files in this app's folder, so load the root one as well.
// Variables already set in the environment win.
const rootEnv = join(process.cwd(), "..", "..", ".env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  // @ipolens/shared ships TypeScript source.
  transpilePackages: ["@ipolens/shared"],
  // Every page reads live data, so it streams behind <Suspense> (see the page files).
  cacheComponents: true,
  partialPrefetching: true,
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
