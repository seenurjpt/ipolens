import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ipolens/shared ships TypeScript source.
  transpilePackages: ["@ipolens/shared"],
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
