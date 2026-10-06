import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl } from "@/lib/site";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

vi.mock("next/server", () => ({ connection: async () => {} }));

afterEach(() => vi.unstubAllEnvs());

describe("siteUrl", () => {
  it("uses SITE_URL and keeps only the origin", () => {
    vi.stubEnv("SITE_URL", "https://signoffly.duckdns.org/some/path/");
    expect(siteUrl().toString()).toBe("https://signoffly.duckdns.org/");
  });
  it("falls back to localhost when SITE_URL is missing or not a web address", () => {
    for (const bad of ["", "   ", "signoffly.dev", "javascript:alert(1)", "ftp://x.dev"]) {
      vi.stubEnv("SITE_URL", bad);
      expect(siteUrl().toString(), bad).toBe("http://localhost:3000/");
    }
  });
});

describe("robots.txt and sitemap.xml", () => {
  it("keeps crawlers out of the API and points at the sitemap", async () => {
    vi.stubEnv("SITE_URL", "https://signoffly.dev");
    const r = await robots();
    expect(r.rules).toEqual({ userAgent: "*", allow: "/", disallow: "/api/" });
    expect(r.sitemap).toBe("https://signoffly.dev/sitemap.xml");
  });
  it("lists only public pages", async () => {
    vi.stubEnv("SITE_URL", "https://signoffly.dev");
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toEqual(["https://signoffly.dev/", "https://signoffly.dev/pricing", "https://signoffly.dev/privacy", "https://signoffly.dev/terms"]);
  });
});

describe("private pages", () => {
  // Reports, account and history belong to one person and must never be indexed.
  it.each(["scan/[id]", "signin", "history", "account", "account/delete"])("%s is marked noindex", (route) => {
    const src = readFileSync(join(process.cwd(), "src/app", route, "page.tsx"), "utf8");
    expect(src).toMatch(/export const metadata = \{[^}]*\.\.\.PRIVATE/);
  });
});
