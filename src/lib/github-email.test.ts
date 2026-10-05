import { describe, expect, it, vi } from "vitest";
import { primaryVerifiedEmail } from "@/lib/github-email";

const reply = (status: number, body: unknown) => vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe("primaryVerifiedEmail", () => {
  it("returns the primary email when GitHub has verified it", async () => {
    const f = reply(200, [
      { email: "other@example.com", primary: false, verified: true },
      { email: "me@example.com", primary: true, verified: true },
    ]);
    expect(await primaryVerifiedEmail("tok", f)).toBe("me@example.com");
    expect(f.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("refuses a primary email that is not verified, because the API links accounts by verified email only", async () => {
    expect(await primaryVerifiedEmail("tok", reply(200, [{ email: "me@example.com", primary: true, verified: false }]))).toBeNull();
  });

  it("does not fall back to a verified non-primary email", async () => {
    expect(await primaryVerifiedEmail("tok", reply(200, [{ email: "x@example.com", primary: false, verified: true }]))).toBeNull();
  });

  it("returns null without a token, on an error, on a network failure and on junk", async () => {
    expect(await primaryVerifiedEmail(undefined, reply(200, []))).toBeNull();
    expect(await primaryVerifiedEmail("tok", reply(401, { message: "Bad credentials" }))).toBeNull();
    expect(await primaryVerifiedEmail("tok", vi.fn().mockRejectedValue(new Error("offline")))).toBeNull();
    expect(await primaryVerifiedEmail("tok", reply(200, { not: "a list" }))).toBeNull();
  });
});