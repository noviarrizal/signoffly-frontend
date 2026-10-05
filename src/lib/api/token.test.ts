// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { decodeProtectedHeader, jwtVerify } from "jose";
import { testKeys } from "@/test/keys";
import { mintApiToken } from "@/lib/api/token";

let keys: Awaited<ReturnType<typeof testKeys>>;
const USER = "5f0a64c4-62d6-4b9b-8e0e-7b6f5c2f6d11";

beforeAll(async () => {
  keys = await testKeys();
});
beforeEach(() => {
  process.env.API_TOKEN_PRIVATE_KEY = keys.privatePem;
  delete process.env.API_TOKEN_ISSUER;
});

describe("mintApiToken", () => {
  it("signs a token the Go API will accept: EdDSA, the right claims, a short life", async () => {
    const token = await mintApiToken(USER);
    expect(decodeProtectedHeader(token).alg).toBe("EdDSA");
    const { payload } = await jwtVerify(token, keys.publicKey, { issuer: "signoffly-web", audience: "signoffly-api" });
    expect(payload.sub).toBe(USER);
    expect(payload.iat).toBeTypeOf("number");
    const life = (payload.exp as number) - (payload.iat as number);
    expect(life).toBeGreaterThan(0);
    expect(life).toBeLessThanOrEqual(15 * 60); // the API refuses anything above one hour; we stay far below
  });

  it("uses the configured issuer", async () => {
    process.env.API_TOKEN_ISSUER = "custom-issuer";
    const { payload } = await jwtVerify(await mintApiToken(USER), keys.publicKey, { issuer: "custom-issuer", audience: "signoffly-api" });
    expect(payload.iss).toBe("custom-issuer");
  });

  it("accepts the PEM written on one line with \\n, as in a .env file", async () => {
    process.env.API_TOKEN_PRIVATE_KEY = keys.privatePem.trim().replace(/\n/g, "\\n");
    await expect(jwtVerify(await mintApiToken(USER), keys.publicKey)).resolves.toBeTruthy();
  });

  it("carries nothing but the user id", async () => {
    const { payload } = await jwtVerify(await mintApiToken(USER), keys.publicKey);
    expect(Object.keys(payload).sort()).toEqual(["aud", "exp", "iat", "iss", "sub"]);
  });

  it("fails clearly when the key is missing", async () => {
    delete process.env.API_TOKEN_PRIVATE_KEY;
    await expect(mintApiToken(USER)).rejects.toThrow(/API_TOKEN_PRIVATE_KEY is not set/);
  });
});