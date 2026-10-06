import "server-only";

const LOCAL = "http://localhost:3000";

/**
 * The public address of the site, from SITE_URL (for example https://signoffly.duckdns.org).
 * Search engines and link previews need absolute URLs. Without a valid value it falls back to
 * localhost, which only makes sense in development.
 */
export function siteUrl(): URL {
  const raw = process.env.SITE_URL?.trim();
  if (raw) {
    try {
      const url = new URL(raw);
      if (url.protocol === "https:" || url.protocol === "http:") return new URL(url.origin);
    } catch {
      // Fall through to the local address.
    }
  }
  return new URL(LOCAL);
}

/** Pages that belong to one person (reports, account, history, sign-in). They must never show up in search results. */
export const PRIVATE = { robots: { index: false, follow: false } } as const;
