/** An error answered by the Go API, in its stable shape: { error: { code, message, resets_at? } }. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly resetsAt?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const FALLBACK = "Something went wrong on our side. Try again in a moment.";

/** Turns any failed response body into an ApiError without ever throwing. */
export function parseApiError(status: number, body: unknown): ApiError {
  const e = (body as { error?: { code?: unknown; message?: unknown; resets_at?: unknown } } | null)?.error;
  const code = typeof e?.code === "string" ? e.code : "internal_error";
  const message = typeof e?.message === "string" && e.message ? e.message : FALLBACK;
  const resets = typeof e?.resets_at === "string" ? e.resets_at : undefined;
  return new ApiError(status, code, message, resets);
}

export function errorBody(code: string, message: string) {
  return { error: { code, message } };
}