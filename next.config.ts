import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The end-to-end tests run their own dev server in a separate build folder, so they never clash with `pnpm dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
