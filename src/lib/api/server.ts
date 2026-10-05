import "server-only";
import { goApiUrl, requireEnv } from "@/lib/env";
import { ApiError, parseApiError } from "@/lib/api/errors";

const TIMEOUT_MS = 20_000;

/** Calls an internal endpoint of the Go API with the service secret. Never used for user requests. */
export async function internalFetch<T>(path: string, init: { method: string; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${goApiUrl()}${path}`, {
      method: init.method,
      headers: {
        "X-Service-Secret": requireEnv("INTERNAL_SERVICE_SECRET"),
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(502, "api_unreachable", "We could not reach the scanning service. Try again in a moment.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw parseApiError(res.status, body);
  return body as T;
}