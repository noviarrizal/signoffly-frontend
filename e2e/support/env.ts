import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";

/** Reads a simple KEY=VALUE file, ignoring comments and blank lines. */
export function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  return out;
}

// Optional: .env.e2e (git-ignored) can point the tests at their own database. See e2e/README.md.
const local = readEnvFile(resolve(process.cwd(), ".env.e2e"));
const pick = (name: string) => process.env[name] || local[name] || "";

export const PORTS = { frontend: 3200, backend: 19090 } as const;
export const FRONTEND_URL = `http://localhost:${PORTS.frontend}`;
export const BACKEND_URL = `http://localhost:${PORTS.backend}`;

export const BACKEND_DIR = resolve(process.cwd(), pick("E2E_BACKEND_DIR") || "../signoffly-backend");
export const WORK_DIR = resolve(tmpdir(), "signoffly-e2e-scans");

/** A separate database for the tests, if one was configured. Otherwise the backend uses its own .env. */
export const E2E_DATABASE = {
  url: pick("E2E_DATABASE_URL"),
  direct: pick("E2E_DATABASE_URL_DIRECT"),
};

/** Scans that call GitHub are slow and use the network, so they only run when asked for. */
export const NETWORK_TESTS = pick("E2E_NETWORK") === "1";