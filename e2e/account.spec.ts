import { readFileSync } from "node:fs";
import { expect, removeAccount, signInAs, test, uniqueHandle } from "./fixtures";

test("signing in shows the signed-in navigation, and signing out takes it away", async ({ page, account }) => {
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "History" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Account" })).toBeVisible();
  expect(account.userId).toMatch(/^[0-9a-f-]{36}$/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
  await expect.poll(async () => (await page.request.get("/api/me")).status()).toBe(401);
});

test("a new account starts with a full quota, no scans, no orders and no passes", async ({ page, account }) => {
  expect(account.userId).toBeTruthy(); // the fixture signed in
  await page.goto("/account");
  await expect(page.getByText("0 of 3 used")).toBeVisible();
  await expect(page.getByText("No active passes.")).toBeVisible();
  await expect(page.getByText("No scans yet.")).toBeVisible();
  await expect(page.getByText("No orders yet.")).toBeVisible();

  await page.goto("/history");
  await expect(page.getByRole("heading", { level: 1, name: "Your scans" })).toBeVisible();
  await expect(page.getByText("No scans yet.")).toBeVisible();
});

test("the data export downloads as a JSON file of this account", async ({ page, account }) => {
  await page.goto("/account");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download my data" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^signoffly-export-\d{4}-\d{2}-\d{2}\.json$/);

  const data = JSON.parse(readFileSync((await file.path())!, "utf8"));
  expect(data.user.email).toBe(`${account.handle}@dev.signoffly.local`);
  expect(data.user.id).toBe(account.userId);
  expect(data.sign_in_methods).toHaveLength(1);
  expect(data.notice).toMatch(/personal data/);
  for (const list of ["scans", "orders", "passes"]) expect(data[list]).toEqual([]);
});

test.describe("deleting the account", () => {
  test("a wrong phrase is refused and nothing is deleted", async ({ page, account }) => {
    expect(account.userId).toBeTruthy();
    await page.goto("/account/delete");
    await page.getByLabel(/Type delete my account/).fill("yes please");
    await page.getByRole("button", { name: "Delete my account" }).click();
    await expect(page).toHaveURL(/error=confirm/);
    await expect(page.getByRole("alert").filter({ hasText: "That does not match" })).toBeVisible();
    expect((await page.request.get("/api/me")).status()).toBe(200); // still signed in, still there
  });

  test("the right phrase deletes everything, signs out, and the same sign-in makes a fresh account", async ({ page, account }) => {
    await page.goto("/account/delete");
    await expect(page.getByRole("heading", { level: 1, name: "Delete your account" })).toBeVisible();
    await page.getByLabel(/Type delete my account/).fill("Delete My Account"); // case does not matter
    await page.getByRole("button", { name: "Delete my account" }).click();

    await expect(page).toHaveURL("/?deleted=1");
    await expect(page.getByRole("status").filter({ hasText: "Your account and your data were deleted." })).toBeVisible();
    expect((await page.request.get("/api/me")).status()).toBe(401);

    const again = await signInAs(page, account.handle);
    try {
      expect(again.userId).not.toBe(account.userId);
      const me = await (await page.request.get("/api/me")).json();
      expect(me.quota.used).toBe(0);
    } finally {
      await removeAccount(again.userId);
    }
  });
});

test("an old session whose account was deleted is told to sign in again", async ({ page, account }) => {
  await removeAccount(account.userId); // deleted behind the session's back, like an admin or another device
  const res = await page.request.post("/api/scans", { data: { repo_url: "github.com/acme/shop" }, headers: { "Idempotency-Key": uniqueHandle("key") } });
  expect(res.status()).toBe(401);
  expect((await res.json()).error.code).toBe("unauthorized");
});
test("someone who has not scanned yet sees the ordinary page with their free scans counted, and a signed-in menu", async ({ page, account }) => {
  expect(account.userId).toBeTruthy();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ready to ship.");
  await expect(page.getByText("3 free scans left today")).toBeVisible();
  const menu = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Repos", "History", "Pricing", "Account"]) await expect(menu.getByRole("link", { name })).toBeVisible();
  await expect(menu.getByRole("link", { name: "How it works" })).toHaveCount(0); // not being sold to
});
