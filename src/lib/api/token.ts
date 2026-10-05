import "server-only";
import { importPKCS8, SignJWT, type CryptoKey } from "jose";
import { requireEnv } from "@/lib/env";

const AUDIENCE = "signoffly-api";
const LIFETIME = "10m"; // the API refuses anything above one hour

let cached: { pem: string; key: CryptoKey } | undefined;

async function signingKey(): Promise<CryptoKey> {
  // .env files hold the PEM on one line with literal \n between lines.
  const pem = requireEnv("API_TOKEN_PRIVATE_KEY").replace(/\\n/g, "\n");
  if (cached?.pem === pem) return cached.key;
  const key = (await importPKCS8(pem, "EdDSA")) as CryptoKey;
  cached = { pem, key };
  return key;
}

/** Signs a short-lived token for the Go API. The user id is the only thing it identifies. */
export async function mintApiToken(userId: string): Promise<string> {
  const issuer = process.env.API_TOKEN_ISSUER?.trim() || "signoffly-web";
  return new SignJWT({})
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(issuer)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(LIFETIME)
    .sign(await signingKey());
}