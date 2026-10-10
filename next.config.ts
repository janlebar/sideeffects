import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Keep builds from failing on lint errors (was previously set via an
    // invalid `module.exports` in this ESM/TS config file).
    ignoreDuringBuilds: true,
  },
  // Playwright must not be bundled by Next.js: it spawns browser processes and
  // uses dynamic requires that only work when loaded from node_modules at runtime.
  // sql.js is kept external so its .wasm file can be resolved from node_modules.
  serverExternalPackages: ["playwright", "playwright-core", "sql.js"],
  // Make sure the read-only SQLite snapshot and the sql.js WASM binary are
  // traced into the serverless function bundle (Vercel's filesystem is read-only).
  outputFileTracingIncludes: {
    "/api/side-effects/**": [
      "./lib/data/medicine.db",
      "./lib/data/sql-wasm.wasm",
    ],
    "/api/medicine-names/**": [
      "./lib/data/medicine.db",
      "./lib/data/sql-wasm.wasm",
    ],
    "/api/scrape/**": ["./lib/data/medicine.db", "./lib/data/sql-wasm.wasm"],
  },
};

export default nextConfig;
