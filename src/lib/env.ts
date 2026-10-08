import "server-only";

/** Reads a required server environment variable and fails with a clear message. */
export function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`${name} is not set. See .env.example.`);
  return v;
}

export function goApiUrl(): string {
  return requireEnv("GO_API_URL").replace(/\/+$/, "");
}

/** GitHub sign-in only works when the OAuth app credentials are set. Without them GitHub would receive client_id=undefined. */
export function githubConfigured(): boolean {
  return Boolean(process.env.AUTH_GITHUB_ID?.trim() && process.env.AUTH_GITHUB_SECRET?.trim());
}

/** Google sign-in works only when the OAuth client credentials are set, for the same reason as GitHub. */
export function googleConfigured(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim());
}

export function devLoginEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_LOGIN === "true";
}
/**
 * Names (never values) of settings sign-in needs that are missing. Used only to help a developer
 * during local setup; in production it returns nothing so no configuration detail is shown.
 */
export function missingSetup(): string[] {
  if (process.env.NODE_ENV === "production") return [];
  const need = ["AUTH_SECRET", "GO_API_URL", "INTERNAL_SERVICE_SECRET", "API_TOKEN_PRIVATE_KEY"];
  const missing = need.filter((k) => !process.env[k]?.trim());
  if (!githubConfigured() && !googleConfigured() && process.env.ALLOW_DEV_LOGIN !== "true") {
    missing.push("AUTH_GITHUB_ID and AUTH_GITHUB_SECRET, or AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET (or ALLOW_DEV_LOGIN=true)");
  }
  return missing;
}