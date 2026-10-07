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