// Runs the end-to-end tests including the scans that call GitHub.
import { spawnSync } from "node:child_process";

const result = spawnSync("pnpm", ["exec", "playwright", "test", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, E2E_NETWORK: "1" },
});
process.exit(result.status ?? 1);