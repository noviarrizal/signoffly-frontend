/** Same rule as the design guide (section 5.2). The server checks again. */
const REPO = /github\.com\/[^/\s]+\/[^/\s]+/i;

export function looksLikeRepoUrl(input: string): boolean {
  return REPO.test(input.trim());
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