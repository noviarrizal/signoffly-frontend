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
  const hasGitHub = Boolean(process.env.AUTH_GITHUB_ID?.trim() && process.env.AUTH_GITHUB_SECRET?.trim());
  if (!hasGitHub && process.env.ALLOW_DEV_LOGIN !== "true") missing.push("AUTH_GITHUB_ID and AUTH_GITHUB_SECRET (or ALLOW_DEV_LOGIN=true)");
  return missing;
}