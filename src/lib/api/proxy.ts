import "server-only";
import { auth } from "@/auth";
import { goApiUrl } from "@/lib/env";
import { errorBody } from "@/lib/api/errors";
import { mintApiToken } from "@/lib/api/token";
import { clientIpFrom, FORWARD_HEADER } from "@/lib/api/client-ip";

const TIMEOUT_MS = 20_000;
const MAX_BODY = 8 * 1024;

function json(status: number, body: unknown, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}

/**
 * Forwards one request to the Go API on behalf of the signed-in user.
 *
 * Only routes that call this helper with a fixed `goPath` exist, so it is not an open proxy.
 * The browser never sees the token or the service secret; the user id comes from the
 * session on the server, never from the request.
 */
export async function forwardToApi(req: Request, goPath: string): Promise<Response> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return json(401, errorBody("unauthorized", "Please sign in to continue."));

  const headers: Record<string, string> = { Authorization: `Bearer ${await mintApiToken(userId)}` };
  const key = req.headers.get("Idempotency-Key");
  if (key) headers["Idempotency-Key"] = key;
  const ip = clientIpFrom(req.headers); // so the API limits each visitor, not this server
  if (ip) headers[FORWARD_HEADER] = ip;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
    if (body.length > MAX_BODY) return json(413, errorBody("invalid_request", "That request is too large."));
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(`${goApiUrl()}${goPath}`, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return json(502, errorBody("api_unreachable", "We could not reach the scanning service. Try again in a moment."));
  }

  const text = await res.text();
  const extra: Record<string, string> = {};
  const retry = res.headers.get("Retry-After");
  if (retry) extra["Retry-After"] = retry;
  const disposition = res.headers.get("Content-Disposition");
  if (disposition) extra["Content-Disposition"] = disposition; // the data export is a download
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}