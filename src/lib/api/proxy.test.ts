// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { jwtVerify } from "jose";
import { testKeys } from "@/test/keys";

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: () => authMock() }));

import { forwardToApi } from "@/lib/api/proxy";

const USER = "5f0a64c4-62d6-4b9b-8e0e-7b6f5c2f6d11";
let keys: Awaited<ReturnType<typeof testKeys>>;
const fetchMock = vi.fn();

beforeAll(async () => {
  keys = await testKeys();
});
beforeEach(() => {
  process.env.GO_API_URL = "http://go.test/";
  process.env.API_TOKEN_PRIVATE_KEY = keys.privatePem;
  authMock.mockResolvedValue({ user: { id: USER } });
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const req = (method: string, body?: string, headers: Record<string, string> = {}) =>
  new Request("http://app.test/api/scans", { method, body, headers });
const goResponse = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

describe("forwardToApi", () => {
  it("refuses without a session and never calls the API", async () => {
    authMock.mockResolvedValue(null);
    const res = await forwardToApi(req("POST", "{}"), "/v1/scans");
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("unauthorized");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a session without a user id", async () => {
    authMock.mockResolvedValue({ user: {} });
    expect((await forwardToApi(req("GET"), "/v1/me")).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("signs the call for the session user and forwards the body and idempotency key", async () => {
    fetchMock.mockResolvedValue(goResponse(202, { id: "abc", status: "queued" }));
    const res = await forwardToApi(req("POST", '{"repo_url":"github.com/a/b"}', { "Idempotency-Key": "click-12345678" }), "/v1/scans");
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ id: "abc", status: "queued" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://go.test/v1/scans"); // trailing slash in GO_API_URL is handled
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"repo_url":"github.com/a/b"}');
    expect(init.headers["Idempotency-Key"]).toBe("click-12345678");
    const token = init.headers.Authorization.replace("Bearer ", "");
    const { payload } = await jwtVerify(token, keys.publicKey, { issuer: "signoffly-web", audience: "signoffly-api" });
    expect(payload.sub).toBe(USER);
  });

  it("does not let the browser choose who it is or send its own credentials", async () => {
    fetchMock.mockResolvedValue(goResponse(200, {}));
    await forwardToApi(
      req("POST", '{"repo_url":"x","user_id":"someone-else"}', { Authorization: "Bearer attacker", "X-Service-Secret": "leak", Cookie: "session=abc" }),
      "/v1/scans",
    );
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).not.toContain("attacker");
    expect(Object.keys(headers).map((k) => k.toLowerCase())).not.toContain("x-service-secret");
    expect(Object.keys(headers).map((k) => k.toLowerCase())).not.toContain("cookie");
  });

  it("sends no body for GET", async () => {
    fetchMock.mockResolvedValue(goResponse(200, { quota: {} }));
    await forwardToApi(req("GET"), "/v1/me");
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBeUndefined();
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("passes the API's error and Retry-After through untouched", async () => {
    const body = { error: { code: "daily_limit_reached", message: "You have used your free scans", resets_at: "2026-10-06T10:00:00Z" } };
    fetchMock.mockResolvedValue(goResponse(429, body, { "Retry-After": "3600" }));
    const res = await forwardToApi(req("POST", "{}"), "/v1/scans");
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("3600");
    expect(await res.json()).toEqual(body);
  });

  it("keeps the file name of a download, so the data export saves as a .json file", async () => {
    fetchMock.mockResolvedValue(goResponse(200, { user: {} }, { "Content-Disposition": 'attachment; filename="signoffly-export-2026-10-05.json"' }));
    const res = await forwardToApi(req("GET"), "/v1/me/export");
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="signoffly-export-2026-10-05.json"');
  });

  it("answers 502 in the API's error shape when the API cannot be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed: connect ECONNREFUSED 10.0.0.5:8080"));
    const res = await forwardToApi(req("GET"), "/v1/me");
    expect(res.status).toBe(502);
    const text = JSON.stringify(await res.json());
    expect(text).toContain("api_unreachable");
    expect(text).not.toContain("10.0.0.5"); // internals never reach the browser
  });

  it("rejects an oversized body before calling the API", async () => {
    const res = await forwardToApi(req("POST", "x".repeat(9000)), "/v1/scans");
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never lets the response be cached", async () => {
    fetchMock.mockResolvedValue(goResponse(200, {}));
    expect((await forwardToApi(req("GET"), "/v1/me")).headers.get("Cache-Control")).toBe("no-store");
  });
});