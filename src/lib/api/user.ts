import "server-only";
import { goApiUrl } from "@/lib/env";
import { ApiError, parseApiError } from "@/lib/api/errors";
import { mintApiToken } from "@/lib/api/token";
import { clientIpHeader } from "@/lib/api/client-ip";

/** Server-side call that changes something as one signed-in user. Resolves when the API answers with a success status. */
export async function userSend(userId: string, path: string, init: { method: string; body?: unknown }): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${goApiUrl()}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${await mintApiToken(userId)}`,
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(await clientIpHeader()),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new ApiError(502, "api_unreachable", "We could not reach the scanning service. Try again in a moment.");
  }
  if (!res.ok) throw parseApiError(res.status, await res.json().catch(() => null));
}

/** Server-side call to the Go API as one signed-in user (for server components). */
export async function userFetch<T>(userId: string, path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${goApiUrl()}${path}`, {
      headers: { Authorization: `Bearer ${await mintApiToken(userId)}`, ...(await clientIpHeader()) },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ApiError(502, "api_unreachable", "We could not reach the scanning service. Try again in a moment.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw parseApiError(res.status, body);
  return body as T;
}