import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Keep builds from failing on lint errors (was previously set via an
    // invalid `module.exports` in this ESM/TS config file).
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
