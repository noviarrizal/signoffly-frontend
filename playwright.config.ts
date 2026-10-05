import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { BACKEND_DIR, BACKEND_URL, E2E_DATABASE, FRONTEND_URL, PORTS, WORK_DIR } from "./e2e/support/env";
import { loadSecrets } from "./e2e/support/secrets";

if (!existsSync(resolve(BACKEND_DIR, "go.mod"))) {
  throw new Error(`The backend was not found at ${BACKEND_DIR}. Put it next to this repo or set E2E_BACKEND_DIR in .env.e2e.`);
}

const secrets = loadSecrets();

// Windows has Microsoft Edge, so no browser has to be downloaded. Elsewhere Playwright's own Chromium is used
// (run `pnpm exec playwright install chromium` once).
const channel = process.env.PW_CHANNEL || (process.platform === "win32" ? "msedge" : undefined);

const serverBinary = process.platform === "win32" ? "server.exe" : "server";
const binaryPath = resolve(process.cwd(), ".e2e", serverBinary);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: process.env.CI ? 2 : 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: FRONTEND_URL, trace: "retain-on-failure", screenshot: "only-on-failure", ...(channel ? { channel } : {}) },
  projects: [
    { name: "desktop", testIgnore: /mobile\.spec\.ts/, use: { ...devices["Desktop Chrome"], ...(channel ? { channel } : {}) } },
    { name: "mobile", testMatch: /mobile\.spec\.ts/, use: { ...devices["Pixel 5"], ...(channel ? { channel } : {}) } },
  ],
  webServer: [
    {
      // The Go API, built once and started with throwaway secrets on its own port.
      command: `go build -o "${binaryPath}" ./cmd/server && "${binaryPath}"`,
      cwd: BACKEND_DIR,
      url: `${BACKEND_URL}/healthz`,
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        HTTP_ADDR: `:${PORTS.backend}`,
        APP_ENV: "development",
        WORK_DIR,
        API_TOKEN_PUBLIC_KEY: secrets.publicKey,
        API_TOKEN_ISSUER: "signoffly-web",
        INTERNAL_SERVICE_SECRET: secrets.internalSecret,
        MANUAL_PAYMENT_INSTRUCTIONS: "Transfer to the test account.",
        FREE_SCANS_PER_DAY: "3",
        GLOBAL_SCANS_PER_DAY: "1000",
        RATE_LIMIT_PER_MIN: "5000",
        ...(E2E_DATABASE.url ? { DATABASE_URL: E2E_DATABASE.url } : {}),
        ...(E2E_DATABASE.direct ? { DATABASE_URL_DIRECT: E2E_DATABASE.direct } : {}),
      },
    },
    {
      // The website, in its own build folder so it never clashes with `pnpm dev`.
      command: `pnpm exec next dev -p ${PORTS.frontend}`,
      url: FRONTEND_URL,
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        GO_API_URL: BACKEND_URL,
        INTERNAL_SERVICE_SECRET: secrets.internalSecret,
        API_TOKEN_PRIVATE_KEY: secrets.privateKeyEnv,
        API_TOKEN_ISSUER: "signoffly-web",
        AUTH_SECRET: secrets.authSecret,
        AUTH_URL: FRONTEND_URL,
        AUTH_TRUST_HOST: "true",
        ALLOW_DEV_LOGIN: "true",
        AUTH_GITHUB_ID: "",
        AUTH_GITHUB_SECRET: "",
        LEGAL_OPERATOR_NAME: "E2E Operator",
        LEGAL_CONTACT_EMAIL: "legal@e2e.test",
      },
    },
  ],
});