import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

/** Automated accessibility checks. They catch a part of the problems (contrast, names, labels), not all of them. */
const PAGES = ["/", "/pricing", "/signin", "/privacy", "/terms"];

async function violations(page: import("@playwright/test").Page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return result.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.length} element(s), e.g. ${v.nodes[0]?.target.join(" ")}`);
}

for (const path of PAGES) {
  test(`${path} has no serious accessibility problems in the light theme`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await violations(page)).toEqual([]);
  });
}

test("the landing page and the legal pages are also fine in the dark theme", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  for (const path of ["/", "/privacy"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await violations(page), path).toEqual([]);
  }
});

test("the signed-in pages are accessible too", async ({ page, account }) => {
  expect(account.userId).toBeTruthy();
  for (const path of ["/account", "/history", "/account/delete"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await violations(page), path).toEqual([]);
  }
});