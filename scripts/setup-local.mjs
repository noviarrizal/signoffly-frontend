// Creates .env.local for local development and prints the two lines the backend needs.
//
//   pnpm setup:local            create .env.local (refuses to overwrite)
//   pnpm setup:local --force    replace it with fresh secrets
//   pnpm setup:local --show     print the two backend lines again from the existing .env.local
//
// Everything is generated here with Node's own crypto, so no other tool is needed.
import { createPrivateKey, createPublicKey, generateKeyPairSync, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** "http://localhost:PORT" for a backend HTTP_ADDR such as ":18080" or "127.0.0.1:9000". Defaults to the backend default, 8080. */
export function apiUrlFromAddr(addr) {
  const m = /:(\d{2,5})\s*$/.exec(addr ?? "");
  return `http://localhost:${m ? m[1] : 8080}`;
}

/** Looks for the backend next to this repo and uses its HTTP_ADDR, so GO_API_URL points at the right port. */
function detectBackendUrl() {
  const file = resolve(process.cwd(), "..", "signoffly-backend", ".env");
  try {
    const m = /^HTTP_ADDR=(.*)$/m.exec(readFileSync(file, "utf8"));
    return apiUrlFromAddr(m?.[1]?.trim().replace(/^"|"$/g, ""));
  } catch {
    return apiUrlFromAddr(undefined);
  }
}

/** Fresh secrets and the file contents for a local setup. Pure, so it can be tested. */
export function buildLocalEnv({ goApiUrl = "http://localhost:8080" } = {}) {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const privatePem = privateKey.export({ type: "pkcs8", format: "pem" }).toString().trim();
  // An Ed25519 SPKI document ends with the 32 raw public key bytes, which is the format the backend reads.
  const publicRaw = publicKey.export({ type: "spki", format: "der" }).subarray(-32);
  const apiTokenPublicKey = publicRaw.toString("base64");
  const internalSecret = randomBytes(24).toString("hex"); // 48 characters; the backend wants at least 32
  const authSecret = randomBytes(32).toString("base64");

  const env = [
    "# Created by `pnpm setup:local`. Never commit this file.",
    `GO_API_URL=${goApiUrl}`,
    `INTERNAL_SERVICE_SECRET=${internalSecret}`,
    `API_TOKEN_PRIVATE_KEY="${privatePem.replace(/\n/g, "\\n")}"`,
    "API_TOKEN_ISSUER=signoffly-web",
    `AUTH_SECRET=${authSecret}`,
    "AUTH_TRUST_HOST=true",
    "",
    "# Local only: shows a Dev sign in form so you can use the app without a GitHub OAuth app.",
    "ALLOW_DEV_LOGIN=true",
    "",
    "# Real sign-in: create a GitHub OAuth app (callback http://localhost:3000/api/auth/callback/github).",
    "# AUTH_GITHUB_ID=",
    "# AUTH_GITHUB_SECRET=",
    "",
    "# Shown in the Privacy Policy and the Terms (your own name or business name, and a contact email).",
    "# LEGAL_OPERATOR_NAME=",
    "# LEGAL_CONTACT_EMAIL=",
    "",
  ].join("\n");

  return { env, backend: { API_TOKEN_PUBLIC_KEY: apiTokenPublicKey, INTERNAL_SERVICE_SECRET: internalSecret } };
}

/** The two backend lines, worked out from the text of an existing .env.local. Returns null if it is not usable. */
export function backendLinesFromEnv(envText) {
  const get = (name) => new RegExp(`^${name}=(.*)$`, "m").exec(envText)?.[1]?.trim().replace(/^"|"$/g, "");
  const pem = get("API_TOKEN_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  const secret = get("INTERNAL_SERVICE_SECRET");
  if (!pem || !secret) return null;
  try {
    const publicRaw = createPublicKey(createPrivateKey(pem)).export({ type: "spki", format: "der" }).subarray(-32);
    return { API_TOKEN_PUBLIC_KEY: publicRaw.toString("base64"), INTERNAL_SERVICE_SECRET: secret };
  } catch {
    return null;
  }
}

function main() {
  const target = resolve(process.cwd(), ".env.local");
  if (process.argv.includes("--show")) {
    if (!existsSync(target)) {
      console.error(".env.local does not exist yet. Run `pnpm setup:local` first.");
      process.exit(1);
    }
    const lines = backendLinesFromEnv(readFileSync(target, "utf8"));
    if (!lines) {
      console.error(".env.local has no usable API_TOKEN_PRIVATE_KEY or INTERNAL_SERVICE_SECRET. Run `pnpm setup:local --force`.");
      process.exit(1);
    }
    console.log("Add these two lines to the backend .env (signoffly-backend), then restart it:\n");
    console.log(`API_TOKEN_PUBLIC_KEY=${lines.API_TOKEN_PUBLIC_KEY}`);
    console.log(`INTERNAL_SERVICE_SECRET=${lines.INTERNAL_SERVICE_SECRET}`);
    return;
  }
  if (existsSync(target) && !process.argv.includes("--force")) {
    console.error(".env.local already exists, so nothing was changed.");
    console.error("Run `pnpm setup:local --force` to replace it with fresh secrets (the backend must then be updated too).");
    process.exit(1);
  }
  const goApiUrl = detectBackendUrl();
  const { env, backend } = buildLocalEnv({ goApiUrl });
  writeFileSync(target, env, { encoding: "utf8", mode: 0o600 });
  console.log("Wrote .env.local (GO_API_URL=" + goApiUrl + ", taken from the backend HTTP_ADDR)\n");
  console.log("Now add these two lines to the backend .env (signoffly-backend) and restart it:\n");
  console.log(`API_TOKEN_PUBLIC_KEY=${backend.API_TOKEN_PUBLIC_KEY}`);
  console.log(`INTERNAL_SERVICE_SECRET=${backend.INTERNAL_SERVICE_SECRET}\n`);
  console.log("Then run `pnpm dev`. On the sign-in page use the Dev sign in form.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();