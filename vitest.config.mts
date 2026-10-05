import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    exclude: ["**/node_modules/**", "e2e/**", ".next*/**"], // the end-to-end tests run with Playwright
    // `server-only` throws when imported outside a React Server environment.
    alias: { "server-only": new URL("./src/test/server-only.ts", import.meta.url).pathname },
  },
});