import { generateKeyPairSync, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface E2ESecrets {
  internalSecret: string;
  authSecret: string;
  /** Ed25519 private key, PKCS8 PEM written on one line with \n, the way .env files hold it. */
  privateKeyEnv: string;
  /** The matching public key as base64 of the 32 raw bytes, the format the backend reads. */
  publicKey: string;
}

const FILE = resolve(process.cwd(), ".e2e", "secrets.json");

/**
 * Throwaway secrets for the test servers. They are made once, kept in the git-ignored .e2e folder and read by
 * every Playwright process, so the servers and the tests agree. Nothing here is ever a real secret.
 */
export function loadSecrets(): E2ESecrets {
  if (existsSync(FILE)) return JSON.parse(readFileSync(FILE, "utf8")) as E2ESecrets;

  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString().trim();
  const secrets: E2ESecrets = {
    internalSecret: randomBytes(24).toString("hex"),
    authSecret: randomBytes(32).toString("base64"),
    privateKeyEnv: pem.replace(/\n/g, "\\n"),
    publicKey: publicKey.export({ type: "spki", format: "der" }).subarray(-32).toString("base64"),
  };
  mkdirSync(resolve(process.cwd(), ".e2e"), { recursive: true });
  writeFileSync(FILE, JSON.stringify(secrets), { mode: 0o600 });
  return secrets;
}