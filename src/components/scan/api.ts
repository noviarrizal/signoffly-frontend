import { ApiError, parseApiError } from "@/lib/api/errors";
import { t } from "@/lib/messages";

/** Browser-side call to our own BFF routes. Always resolves to parsed JSON or throws an ApiError. */
export async function bff<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, cache: "no-store" });
  } catch {
    throw new ApiError(0, "network", t("error.network"));
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw parseApiError(res.status, body);
  return body as T;
}