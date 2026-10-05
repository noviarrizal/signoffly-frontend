import { expect, test } from "./fixtures";

const PAGES = ["/", "/pricing", "/signin", "/privacy", "/terms"];

test.describe("on a phone", () => {
  for (const path of PAGES) {
    test(`${path} never scrolls sideways`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
      expect(scrollWidth, `${path} is ${scrollWidth}px wide on a ${clientWidth}px screen`).toBeLessThanOrEqual(clientWidth);
    });
  }

  test("the menu opens, lists the pages, closes with Escape and when a link is chosen", async ({ page }) => {
    await page.goto("/");
    const open = page.getByRole("button", { name: "Open menu" });
    await expect(open).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden(); // the desktop navigation is not shown

    await open.click();
    const menu = page.getByRole("navigation", { name: "Menu" });
    await expect(menu.getByRole("link", { name: "Scan a repo" })).toBeVisible();
    for (const name of ["How it works", "Checks", "Sample report", "Pricing", "Sign in"]) await expect(menu.getByRole("link", { name })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Menu" }).getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.getByRole("navigation", { name: "Menu" })).toBeHidden();
  });

  test("the menu changes with the session", async ({ page, account }) => {
    expect(account.userId).toBeTruthy();
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("navigation", { name: "Menu" });
    await expect(menu.getByRole("link", { name: "History" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Account" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Sign in" })).toHaveCount(0);
    await menu.getByRole("button", { name: "Sign out" }).click();
    await expect.poll(async () => (await page.request.get("/api/me")).status()).toBe(401); // the address stays "/", so wait for the session to end
    await page.reload();
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation", { name: "Menu" }).getByRole("link", { name: "Sign in" })).toBeVisible();
  });
});