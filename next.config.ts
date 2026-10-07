import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The end-to-end tests run their own dev server in a separate build folder, so they never clash with `pnpm dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The Docker image runs `node server.js` from a small self-contained copy of the app. Plain `next build` is unchanged.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
};

export default nextConfig;
