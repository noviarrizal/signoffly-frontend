// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { devLoginEnabled, githubConfigured, googleConfigured, missingSetup } from "@/lib/env";

afterEach(() => vi.unstubAllEnvs());

describe("githubConfigured", () => {
  it("needs both the id and the secret, so GitHub never receives client_id=undefined", () => {
    vi.stubEnv("AUTH_GITHUB_ID", "");
    vi.stubEnv("AUTH_GITHUB_SECRET", "");
    expect(githubConfigured()).toBe(false);
    vi.stubEnv("AUTH_GITHUB_ID", "abc");
    expect(githubConfigured()).toBe(false);
    vi.stubEnv("AUTH_GITHUB_SECRET", "xyz");
    expect(githubConfigured()).toBe(true);
    vi.stubEnv("AUTH_GITHUB_ID", "   ");
    expect(githubConfigured()).toBe(false);
  });
});

describe("devLoginEnabled", () => {
  it("is never on in production", () => {
    vi.stubEnv("ALLOW_DEV_LOGIN", "true");
    vi.stubEnv("NODE_ENV", "production");
    expect(devLoginEnabled()).toBe(false);
    vi.stubEnv("NODE_ENV", "development");
    expect(devLoginEnabled()).toBe(true);
  });
});

describe("missingSetup", () => {
  it("lists names only, and nothing at all in production", () => {
    for (const k of ["AUTH_SECRET", "GO_API_URL", "INTERNAL_SERVICE_SECRET", "API_TOKEN_PRIVATE_KEY", "AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET", "ALLOW_DEV_LOGIN"]) vi.stubEnv(k, "");
    vi.stubEnv("NODE_ENV", "development");
    const missing = missingSetup();
    expect(missing).toEqual(expect.arrayContaining(["AUTH_SECRET", "GO_API_URL", "INTERNAL_SERVICE_SECRET", "API_TOKEN_PRIVATE_KEY"]));
    vi.stubEnv("AUTH_SECRET", "super-secret-value");
    expect(missingSetup().join(" ")).not.toContain("super-secret-value");
    vi.stubEnv("NODE_ENV", "production");
    expect(missingSetup()).toEqual([]);
  });

  it("is satisfied by dev sign-in when GitHub is not set up", () => {
    for (const k of ["AUTH_SECRET", "GO_API_URL", "INTERNAL_SERVICE_SECRET", "API_TOKEN_PRIVATE_KEY"]) vi.stubEnv(k, "x");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_GITHUB_ID", "");
    vi.stubEnv("ALLOW_DEV_LOGIN", "true");
    expect(missingSetup()).toEqual([]);
  });
});

describe("googleConfigured", () => {
  it("needs both the id and the secret, so Google never receives an empty client id", () => {
    vi.stubEnv("AUTH_GOOGLE_ID", "");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "");
    expect(googleConfigured()).toBe(false);
    vi.stubEnv("AUTH_GOOGLE_ID", "abc.apps.googleusercontent.com");
    expect(googleConfigured()).toBe(false);
    vi.stubEnv("AUTH_GOOGLE_SECRET", "xyz");
    expect(googleConfigured()).toBe(true);
    vi.stubEnv("AUTH_GOOGLE_SECRET", "   ");
    expect(googleConfigured()).toBe(false);
  });

  it("is a sign-in method on its own, so GitHub is not required for a working setup", () => {
    for (const k of ["AUTH_SECRET", "GO_API_URL", "INTERNAL_SERVICE_SECRET", "API_TOKEN_PRIVATE_KEY"]) vi.stubEnv(k, "x");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_GITHUB_ID", "");
    vi.stubEnv("ALLOW_DEV_LOGIN", "");
    expect(missingSetup().join(" ")).toContain("AUTH_GOOGLE_ID");
    vi.stubEnv("AUTH_GOOGLE_ID", "id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "secret");
    expect(missingSetup()).toEqual([]);
  });
});