import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { siteUrl } from "@/lib/site";

// Private pages are not blocked here on purpose: crawlers must be able to fetch them to see their noindex tag.
export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection(); // SITE_URL is read at request time, not baked in at build time
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
