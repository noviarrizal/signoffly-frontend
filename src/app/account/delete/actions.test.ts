// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const signOutMock = vi.fn();
const sendMock = vi.fn();
class Redirect extends Error {
  constructor(public url: string) {
    super(`redirect:${url}`);
  }
}
vi.mock("@/auth", () => ({ auth: () => authMock(), signOut: (o: unknown) => signOutMock(o) }));
vi.mock("@/lib/api/user", () => ({ userSend: (...a: unknown[]) => sendMock(...a) }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirect(url);
  },
}));

import { deleteAccount } from "@/app/account/delete/actions";

const form = (confirm?: string) => {
  const f = new FormData();
  if (confirm !== undefined) f.set("confirm", confirm);
  return f;
};
const redirectOf = async (fn: () => Promise<void>) => {
  try {
    await fn();
  } catch (e) {
    if (e instanceof Redirect) return e.url;
    throw e;
  }
  return null;
};

beforeEach(() => {
  authMock.mockReset().mockResolvedValue({ user: { id: "u-1" } });
  signOutMock.mockReset().mockResolvedValue(undefined);
  sendMock.mockReset().mockResolvedValue(undefined);
});

describe("deleteAccount", () => {
  it("sends a signed-out visitor to sign in and deletes nothing", async () => {
    authMock.mockResolvedValue(null);
    expect(await redirectOf(() => deleteAccount(form("delete my account")))).toBe("/signin");
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("does nothing without the typed confirmation", async () => {
    for (const typed of [undefined, "", "delete", "yes please"]) {
      expect(await redirectOf(() => deleteAccount(form(typed)))).toBe("/account/delete?error=confirm");
    }
    expect(sendMock).not.toHaveBeenCalled();
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("deletes the signed-in account, then signs out and says it is gone", async () => {
    await deleteAccount(form("Delete my account"));
    expect(sendMock).toHaveBeenCalledWith("u-1", "/v1/me", { method: "DELETE", body: { confirm: "delete my account" } });
    expect(signOutMock).toHaveBeenCalledWith({ redirectTo: "/?deleted=1" });
    expect(sendMock.mock.invocationCallOrder[0]).toBeLessThan(signOutMock.mock.invocationCallOrder[0]);
  });

  it("acts on the account of the session, never on one named in the form", async () => {
    const f = form("delete my account");
    f.set("user_id", "someone-else");
    await deleteAccount(f);
    expect(sendMock.mock.calls[0][0]).toBe("u-1");
  });

  it("stays signed in and shows an error if the API fails, so nothing looks deleted when it is not", async () => {
    sendMock.mockRejectedValue(new Error("down"));
    expect(await redirectOf(() => deleteAccount(form("delete my account")))).toBe("/account/delete?error=failed");
    expect(signOutMock).not.toHaveBeenCalled();
  });
});