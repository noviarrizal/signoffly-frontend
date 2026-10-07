// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { testKeys } from "@/test/keys";

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: () => authMock() }));
const headersMock = vi.fn();
vi.mock("next/headers", () => ({ headers: () => headersMock() }));

import { clientIpFrom, clientIpHeader, FORWARD_HEADER } from "@/lib/api/client-ip";
import { forwardToApi } from "@/lib/api/proxy";
import { userFetch, userSend } from "@/lib/api/user";

const h = (o: Record<string, string>) => new Headers(o);

describe("clientIpFrom", () => {
  afterEach(() => {
    delete process.env.CLIENT_IP_HEADER;
  });

  it.each([
    ["203.0.113.9", "203.0.113.9"],
    ["  203.0.113.9  ", "203.0.113.9"],
    ["2606:4700:4700::1111", "2606:4700:4700::1111"],
    ["203.0.113.9, 10.0.0.1", "203.0.113.9"],
  ])("takes %s", (value, want) => expect(clientIpFrom(h({ "x-real-ip": value }))).toBe(want));

  it.each(["", "not an ip", "999.1.1.1", "203.0.113.9:8080", "<script>alert(1)</script>", "203.0.113.9 X-Evil: 1", "unknown", "evil.example"])(
    "drops %j instead of passing text on to the API",
    (value) => expect(clientIpFrom(h({ "x-real-ip": value }))).toBeNull(),
  );

  it("is empty when the proxy sent nothing", () => expect(clientIpFrom(h({}))).toBeNull());

  it("reads the header named in CLIENT_IP_HEADER, and only that one", () => {
    process.env.CLIENT_IP_HEADER = "CF-Connecting-IP";
    expect(clientIpFrom(h({ "cf-connecting-ip": "198.51.100.7", "x-real-ip": "203.0.113.9", "x-forwarded-for": "192.0.2.1" }))).toBe("198.51.100.7");
    expect(clientIpFrom(h({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "192.0.2.1" }))).toBeNull();
  });
});

describe("the visitor's address reaches the API", () => {
  let keys: Awaited<ReturnType<typeof testKeys>>;
  const fetchMock = vi.fn();
  beforeAll(async () => {
    keys = await testKeys();
  });
  beforeEach(() => {
    process.env.GO_API_URL = "http://go.test";
    process.env.API_TOKEN_PRIVATE_KEY = keys.privatePem;
    authMock.mockResolvedValue({ user: { id: "5f0a64c4-62d6-4b9b-8e0e-7b6f5c2f6d11" } });
    headersMock.mockReset();
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("is forwarded by the route helper from the request", async () => {
    await forwardToApi(new Request("http://app.test/api/me", { headers: { "x-real-ip": "203.0.113.9" } }), "/v1/me");
    expect(fetchMock.mock.calls[0][1].headers[FORWARD_HEADER]).toBe("203.0.113.9");
  });

  it("is not made up when there is none, and a forged value does not get through", async () => {
    await forwardToApi(new Request("http://app.test/api/me"), "/v1/me");
    expect(fetchMock.mock.calls[0][1].headers[FORWARD_HEADER]).toBeUndefined();
    await forwardToApi(new Request("http://app.test/api/me", { headers: { "x-real-ip": "1.2.3.4 X-Evil: yes", [FORWARD_HEADER]: "9.9.9.9" } }), "/v1/me");
    expect(fetchMock.mock.calls[1][1].headers[FORWARD_HEADER]).toBeUndefined();
  });

  it("a header sent by the browser under the forwarding name is never passed on as it is", async () => {
    await forwardToApi(new Request("http://app.test/api/me", { headers: { [FORWARD_HEADER]: "9.9.9.9" } }), "/v1/me");
    expect(fetchMock.mock.calls[0][1].headers[FORWARD_HEADER]).toBeUndefined();
  });

  it("is forwarded by server components and server actions from the request being served", async () => {
    headersMock.mockResolvedValue(h({ "x-real-ip": "198.51.100.23" }));
    await userFetch("u1", "/v1/me");
    await userSend("u1", "/v1/me", { method: "DELETE", body: { confirm: "delete my account" } });
    expect(fetchMock.mock.calls[0][1].headers[FORWARD_HEADER]).toBe("198.51.100.23");
    expect(fetchMock.mock.calls[1][1].headers[FORWARD_HEADER]).toBe("198.51.100.23");
  });

  it("does not break a call made outside a request", async () => {
    headersMock.mockRejectedValue(new Error("headers was called outside a request scope"));
    expect(await clientIpHeader()).toEqual({});
    await expect(userFetch("u1", "/v1/me")).resolves.toEqual({});
  });
});