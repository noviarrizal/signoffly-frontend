import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { siteUrl } from "@/lib/site";

/** Only the public pages. Reports, account and history belong to one person and are never listed. */
const PUBLIC_PATHS = ["/", "/pricing", "/privacy", "/terms"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection(); // SITE_URL is read at request time, not baked in at build time
  const base = siteUrl();
  return PUBLIC_PATHS.map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: path === "/" || path === "/pricing" ? "weekly" : "yearly",
    priority: path === "/" ? 1 : path === "/pricing" ? 0.8 : 0.3,
  }));
}
