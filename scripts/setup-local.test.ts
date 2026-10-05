// @vitest-environment node
import { describe, expect, it } from "vitest";
import { importPKCS8, jwtVerify, SignJWT, importSPKI } from "jose";
import { apiUrlFromAddr, backendLinesFromEnv, buildLocalEnv } from "./setup-local.mjs";

function parse(env: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of env.split("\n")) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

describe("buildLocalEnv", () => {
  it("makes a signing key and a public key that belong together", async () => {
    const { env, backend } = buildLocalEnv();
    const vars = parse(env);
    const priv = await importPKCS8(vars.API_TOKEN_PRIVATE_KEY.replace(/\\n/g, "\n"), "EdDSA");

    // The backend reads the public key as base64 of the 32 raw bytes: wrap it back into SPKI to verify with jose.
    const raw = Buffer.from(backend.API_TOKEN_PUBLIC_KEY, "base64");
    expect(raw).toHaveLength(32);
    const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), raw]);
    const pem = `-----BEGIN PUBLIC KEY-----\n${spki.toString("base64")}\n-----END PUBLIC KEY-----`;
    const pub = await importSPKI(pem, "EdDSA");

    const token = await new SignJWT({}).setProtectedHeader({ alg: "EdDSA" }).setSubject("u").setIssuedAt().setExpirationTime("5m").sign(priv);
    await expect(jwtVerify(token, pub)).resolves.toBeTruthy();
  });

  it("uses one shared secret for both apps and meets the backend minimum", () => {
    const { env, backend } = buildLocalEnv();
    expect(parse(env).INTERNAL_SERVICE_SECRET).toBe(backend.INTERNAL_SERVICE_SECRET);
    expect(backend.INTERNAL_SERVICE_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it("generates new secrets every time", () => {
    const a = parse(buildLocalEnv().env);
    const b = parse(buildLocalEnv().env);
    expect(a.AUTH_SECRET).not.toBe(b.AUTH_SECRET);
    expect(a.API_TOKEN_PRIVATE_KEY).not.toBe(b.API_TOKEN_PRIVATE_KEY);
  });

  it("turns on dev sign-in and keeps the private key on one line", () => {
    const { env } = buildLocalEnv();
    expect(parse(env).ALLOW_DEV_LOGIN).toBe("true");
    expect(env.split("\n").filter((l) => l.startsWith("API_TOKEN_PRIVATE_KEY="))).toHaveLength(1);
  });
});

describe("backendLinesFromEnv", () => {
  it("gives back the same two lines the setup printed, from the saved file", () => {
    const { env, backend } = buildLocalEnv();
    expect(backendLinesFromEnv(env)).toEqual(backend);
  });

  it("returns null for a file that has no key, an empty key or a broken key", () => {
    expect(backendLinesFromEnv("")).toBeNull();
    expect(backendLinesFromEnv("API_TOKEN_PRIVATE_KEY=\nINTERNAL_SERVICE_SECRET=abc")).toBeNull();
    expect(backendLinesFromEnv('API_TOKEN_PRIVATE_KEY="not a key"\nINTERNAL_SERVICE_SECRET=abc')).toBeNull();
  });
});

describe("apiUrlFromAddr", () => {
  it("follows the port the backend listens on", () => {
    expect(apiUrlFromAddr(":18080")).toBe("http://localhost:18080");
    expect(apiUrlFromAddr("127.0.0.1:9000")).toBe("http://localhost:9000");
    expect(apiUrlFromAddr("0.0.0.0:8081")).toBe("http://localhost:8081");
  });
  it("falls back to the backend default when nothing is set", () => {
    expect(apiUrlFromAddr(undefined)).toBe("http://localhost:8080");
    expect(apiUrlFromAddr("")).toBe("http://localhost:8080");
  });
});