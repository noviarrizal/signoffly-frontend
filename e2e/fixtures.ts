import { expect, test as base, type Page } from "@playwright/test";
import { BACKEND_URL } from "./support/env";
import { loadSecrets } from "./support/secrets";

const secrets = loadSecrets();

export interface Account {
  handle: string;
  userId: string;
}

/** Signs in with the development form. The handle makes a new account every time. */
export async function signInAs(page: Page, handle: string): Promise<Account> {
  await page.goto("/signin");
  await page.getByLabel("Handle").fill(handle);
  await page.getByRole("button", { name: "Dev sign in" }).click();
  await expect(page).toHaveURL("/");
  const res = await page.request.get("/api/me");
  expect(res.ok()).toBe(true);
  return { handle, userId: (await res.json()).user_id as string };
}

/** Removes a test account and everything tied to it. A 404 is fine: the test may have deleted it already. */
export async function removeAccount(userId: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/internal/users/${userId}`, { method: "DELETE", headers: { "X-Service-Secret": secrets.internalSecret } });
  if (!res.ok && res.status !== 404) throw new Error(`could not remove the test account ${userId}: ${res.status}`);
}

/** Approves an order the way the owner does, with the service secret. */
export async function approveOrder(orderId: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/internal/orders/${orderId}/approve`, { method: "POST", headers: { "X-Service-Secret": secrets.internalSecret } });
  if (!res.ok) throw new Error(`could not approve ${orderId}: ${res.status}`);
}

let counter = 0;
export const uniqueHandle = (prefix = "e2e") => `${prefix}-${Date.now().toString(36)}-${process.pid}-${counter++}`;

interface Fixtures {
  /** A signed-in account that is removed again when the test ends, whatever the result. */
  account: Account;
}

export const test = base.extend<Fixtures>({
  account: async ({ page }, provide) => { // not named "use": the React lint rule would take it for a hook
    const account = await signInAs(page, uniqueHandle());
    try {
      await provide(account);
    } finally {
      await removeAccount(account.userId);
    }
  },
});

export { expect };