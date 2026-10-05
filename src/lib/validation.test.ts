import { describe, expect, it } from "vitest";
import { isUuid, looksLikeRepoUrl, newIdempotencyKey } from "@/lib/validation";

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