/** Same rule as the design guide (section 5.2). The server checks again. */
const REPO = /github\.com\/[^/\s]+\/[^/\s]+/i;

export function looksLikeRepoUrl(input: string): boolean {
  return REPO.test(input.trim());
}

/** A website address: a host name with a dot, an optional http(s) scheme, no spaces. The server checks it properly. */
const SITE = /^(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:[/?#]\S*)?$/i;

export function looksLikeSite(input: string): boolean {
  return SITE.test(input.trim());
}

/** What the scan box accepts: a GitHub repository, or the address of a website. */
export function looksLikeScanTarget(input: string): boolean {
  return looksLikeRepoUrl(input) || looksLikeSite(input);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string): boolean {
  return UUID.test(v);
}

/** A fresh idempotency key: 8 to 64 characters of letters, digits, "_" and "-". */
export function newIdempotencyKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return "k-" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * What may be put in an address (the sign-in link keeps the pasted link so it can be filled in again afterwards).
 * Addresses end up in server logs and browser history, so a pasted link is cut down first: a repository keeps its
 * path, a website keeps only its scheme, host and port (the check only ever uses the host), and a query string,
 * a fragment and a user:password part are always dropped.
 */
export function linkForUrl(input: string): string {
  const v = input.trim();
  if (looksLikeRepoUrl(v)) {
    const cut = v.search(/[?#]/);
    const noQuery = cut >= 0 ? v.slice(0, cut) : v;
    return noQuery.replace(/^([a-z][a-z0-9+.-]*:\/\/)[^/@]*@/i, "$1").slice(0, 300);
  }
  const m = /^(?:(https?):\/\/)?(?:[^/@?#\s]*@)?([^/:?#\s]+)(:\d+)?/i.exec(v);
  return m ? `${m[1] ? m[1] + "://" : ""}${m[2]}${m[3] ?? ""}`.slice(0, 300) : "";
}
