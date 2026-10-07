import { describe, expect, it } from "vitest";
import { isUuid, looksLikeRepoUrl, looksLikeScanTarget, looksLikeSite, newIdempotencyKey } from "@/lib/validation";

describe("looksLikeRepoUrl", () => {
  it.each(["github.com/a/b", "https://github.com/name/repo", "  github.com/name/repo  ", "http://www.github.com/n/r.git", "GITHUB.COM/A/B"])("accepts %s", (v) => {
    expect(looksLikeRepoUrl(v)).toBe(true);
  });
  it.each(["", "github.com", "github.com/only-owner", "https://example.com/a/b", "just words", "github.com//b"])("rejects %s", (v) => {
    expect(looksLikeRepoUrl(v)).toBe(false);
  });
});

describe("isUuid", () => {
  it("accepts uuids and nothing else", () => {
    expect(isUuid("5f0a64c4-62d6-4b9b-8e0e-7b6f5c2f6d11")).toBe(true);
    for (const v of ["", "not-a-uuid", "5f0a64c4-62d6-4b9b-8e0e-7b6f5c2f6d1", "../../etc/passwd", "5f0a64c4-62d6-4b9b-8e0e-7b6f5c2f6d11/report"]) {
      expect(isUuid(v)).toBe(false);
    }
  });
});

describe("newIdempotencyKey", () => {
  it("fits the API rule (8 to 64 letters, digits, _ or -) and is unique", () => {
    const keys = new Set(Array.from({ length: 50 }, newIdempotencyKey));
    expect(keys.size).toBe(50);
    for (const k of keys) expect(k).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });
});

describe("looksLikeSite and looksLikeScanTarget", () => {
  it.each(["yourapp.com", "https://yourapp.com", "http://my-app.vercel.app/", "  https://Shop.Example.co.id/path?x=1  ", "sub.domain.example.com:443/x"])("accepts the website %s", (v) => {
    expect(looksLikeSite(v)).toBe(true);
    expect(looksLikeScanTarget(v)).toBe(true);
  });
  it.each(["", "hello world", "localhost", "127.0.0.1", "http://127.0.0.1:8080", "ftp://example.com", "yourapp", "exa mple.com", "javascript:alert(1)", "-bad.example.com", "example.c"])("does not accept %s as a website", (v) => {
    expect(looksLikeSite(v)).toBe(false);
  });
  it("accepts a repository too, and nothing else", () => {
    expect(looksLikeScanTarget("github.com/acme/shop")).toBe(true);
    expect(looksLikeScanTarget("not a link")).toBe(false);
    expect(looksLikeScanTarget("")).toBe(false);
  });
});