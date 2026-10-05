import { describe, expect, it } from "vitest";
import { ApiError, parseApiError } from "@/lib/api/errors";

describe("parseApiError", () => {
  it("reads the API's stable shape", () => {
    const e = parseApiError(429, { error: { code: "daily_limit_reached", message: "Used up", resets_at: "2026-10-06T10:00:00Z" } });
    expect(e).toBeInstanceOf(ApiError);
    expect([e.status, e.code, e.message, e.resetsAt]).toEqual([429, "daily_limit_reached", "Used up", "2026-10-06T10:00:00Z"]);
  });
  it.each([null, undefined, "text", 42, {}, { error: null }, { error: { code: 5, message: {} } }])("never throws on %j", (body) => {
    const e = parseApiError(500, body);
    expect(e.code).toBe("internal_error");
    expect(e.message).toMatch(/something went wrong/i);
  });
});