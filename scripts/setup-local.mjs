// Creates .env.local for local development and prints the two lines the backend needs.
//
//   pnpm setup:local            create .env.local (refuses to overwrite)
//   pnpm setup:local --force    replace it with fresh secrets
//
// Everything is generated here with Node's own crypto, so no other tool is needed.
import { generateKeyPairSync, randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  ].join("\n");

  return { env, backend: { API_TOKEN_PUBLIC_KEY: apiTokenPublicKey, INTERNAL_SERVICE_SECRET: internalSecret } };
}

function main() {
  const target = resolve(process.cwd(), ".env.local");
  if (existsSync(target) && !process.argv.includes("--force")) {
    console.error(".env.local already exists, so nothing was changed.");
    console.error("Run `pnpm setup:local --force` to replace it with fresh secrets (the backend must then be updated too).");
    process.exit(1);
  }
  const { env, backend } = buildLocalEnv();
  writeFileSync(target, env, { encoding: "utf8", mode: 0o600 });
  console.log("Wrote .env.local\n");
  console.log("Now add these two lines to the backend .env (signoffly-backend) and restart it:\n");
  console.log(`API_TOKEN_PUBLIC_KEY=${backend.API_TOKEN_PUBLIC_KEY}`);
  console.log(`INTERNAL_SERVICE_SECRET=${backend.INTERNAL_SERVICE_SECRET}\n`);
  console.log("Then run `pnpm dev`. On the sign-in page use the Dev sign in form.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();