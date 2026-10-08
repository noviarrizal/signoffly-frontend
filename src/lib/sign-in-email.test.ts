import { describe, expect, it, vi } from "vitest";
import { googleVerifiedEmail, isOAuthProvider, verifiedEmailFor } from "@/lib/sign-in-email";

describe("googleVerifiedEmail", () => {
  it("takes the email Google says it has verified, in lower case", () => {
    expect(googleVerifiedEmail({ email: "Ana.Budi@Example.com", email_verified: true })).toBe("ana.budi@example.com");
    expect(googleVerifiedEmail({ email: "  me@example.com  ", email_verified: true })).toBe("me@example.com");
  });

  it("refuses everything that is not a plain, verified address", () => {
    for (const profile of [
      { email: "me@example.com", email_verified: false },
      { email: "me@example.com" }, // no claim at all
      { email: "me@example.com", email_verified: "true" }, // text is not the boolean true
      { email: "me@example.com", email_verified: "false" }, // and "false" is truthy as text
      { email: "me@example.com", email_verified: 1 },
      { email: "me@example.com", email_verified: null },
      { email: "", email_verified: true },
      { email: "not an address", email_verified: true },
      { email: 42, email_verified: true },
      { email: ["a@b.co"], email_verified: true },
      {},
      null,
      undefined,
    ]) {
      expect(googleVerifiedEmail(profile as never), JSON.stringify(profile)).toBeNull();
    }
  });
});

describe("verifiedEmailFor", () => {
  const github = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ email: "gh@example.com", primary: true, verified: true }]), { status: 200 }));

  it("asks GitHub for the verified primary email with the access token", async () => {
    expect(await verifiedEmailFor("github", { access_token: "tok" }, undefined, github)).toBe("gh@example.com");
    expect(github.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("reads Google's claims and never calls out for them", async () => {
    const f = vi.fn();
    expect(await verifiedEmailFor("google", { access_token: "tok" }, { email: "g@example.com", email_verified: true }, f)).toBe("g@example.com");
    expect(await verifiedEmailFor("google", { access_token: "tok" }, { email: "g@example.com", email_verified: false }, f)).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });

  it("trusts nothing from a provider it does not know", async () => {
    expect(await verifiedEmailFor("facebook", { access_token: "tok" }, { email: "x@example.com", email_verified: true })).toBeNull();
    expect(await verifiedEmailFor("", null, null)).toBeNull();
  });

  it("does not mix the two: a Google profile cannot vouch for a GitHub sign-in", async () => {
    const f = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }));
    expect(await verifiedEmailFor("github", { access_token: "tok" }, { email: "forged@example.com", email_verified: true }, f)).toBeNull();
  });
});

describe("isOAuthProvider", () => {
  it("knows GitHub and Google, and not the development sign-in", () => {
    expect(isOAuthProvider("github")).toBe(true);
    expect(isOAuthProvider("google")).toBe(true);
    expect(isOAuthProvider("dev")).toBe(false);
    expect(isOAuthProvider(undefined)).toBe(false);
  });
});