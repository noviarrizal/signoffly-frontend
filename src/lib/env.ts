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