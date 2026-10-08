import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Keep builds from failing on lint errors (was previously set via an
    // invalid `module.exports` in this ESM/TS config file).
    ignoreDuringBuilds: true,
  },
  // Playwright must not be bundled by Next.js: it spawns browser processes and
  // uses dynamic requires that only work when loaded from node_modules at runtime.
  serverExternalPackages: ["playwright", "playwright-core"],
};

export default nextConfig;
