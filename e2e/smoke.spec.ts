import { expect, test } from "./fixtures";

test.describe("the public pages", () => {
  test("the landing page tells the story and refuses a link that is not a repository", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ready to ship.");
    await expect(page).toHaveTitle(/Signoffly/);

    await page.getByLabel("GitHub repository or website").first().fill("hello world");
    await page.getByRole("button", { name: "Run a check" }).first().click();
    await expect(page.getByRole("alert").filter({ hasText: "Paste a GitHub link" })).toBeVisible();
  });

  test("a visitor who is not signed in is sent to sign in, and the pasted link is kept", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("GitHub repository or website").first().fill("github.com/acme/shop");
    await page.getByRole("button", { name: "Run a check" }).first().click();
    await expect(page).toHaveURL(/\/signin\?repo=github\.com%2Facme%2Fshop/);
  });

  test("the sign-in page offers only the sign-in methods that are set up", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("button", { name: "Continue with GitHub" })).toBeDisabled(); // no GitHub app in the test setup
    await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0); // and no Google client: no dead button
    await expect(page.getByRole("button", { name: "Dev sign in" })).toBeVisible();
  });
  test("the theme choice survives a reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark"); // light is the default
    // A click made before the page is interactive is lost (this shows right after a reload under load), so click again until it takes.
    const switchTo = (dark: boolean) =>
      expect(async () => {
        await page.getByRole("button", { name: "Switch theme" }).click();
        const html = expect(page.locator("html"));
        await (dark ? html.toHaveAttribute("data-theme", "dark", { timeout: 1_500 }) : html.not.toHaveAttribute("data-theme", "dark", { timeout: 1_500 }));
      }).toPass({ timeout: 15_000 });
    await switchTo(true);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await switchTo(false);
  });

  test("the sample report filters by tab and copies a fix prompt", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/#report");
    const report = page.getByRole("article").filter({ hasText: "lumen-notes/web" });
    await expect(report.getByText("Sample data")).toBeVisible();

    await report.getByRole("tab", { name: /Legal/ }).click();
    await expect(report.getByRole("heading", { name: /no privacy policy/ })).toBeVisible();
    await expect(report.getByRole("heading", { name: /Stripe secret key/ })).toHaveCount(0);

    await report.getByRole("tab", { name: /Security/ }).click();
    await report.getByRole("button", { name: "Copy fix prompt" }).first().click();
    await expect(report.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Stripe");
  });

  test("the FAQ opens and closes", async ({ page }) => {
    await page.goto("/#faq");
    const second = page.locator("details", { hasText: "Does Signoffly run my code?" });
    await expect(second).not.toHaveAttribute("open", "");
    await second.getByText("Does Signoffly run my code?").click();
    await expect(second.getByText(/never starts your app/)).toBeVisible();
  });

  test("the pricing page shows what can be bought today", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("repo");
    await expect(page.getByText("Rp149.000")).toBeVisible();
    await expect(page.getByText("per project, 14 days")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in to get a pass" })).toBeVisible();
  });

  test("an unknown address gets a friendly page", async ({ page }) => {
    const res = await page.goto("/there-is-nothing-here");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "That page does not exist." })).toBeVisible();
  });
});

test.describe("the legal pages", () => {
  for (const [path, title] of [
    ["/privacy", "Privacy policy"],
    ["/terms", "Terms of service"],
  ] as const) {
    test(`${path} names the operator, says it is a draft, and its contents link works`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByText("Draft, not yet reviewed by a lawyer")).toBeVisible();
      await expect(page.getByText("E2E Operator").first()).toBeVisible();
      await expect(page.getByText("legal@e2e.test").first()).toBeVisible();

      const contents = page.getByRole("navigation", { name: "Contents" });
      const last = contents.getByRole("link").last();
      await last.click();
      await expect(page).toHaveURL(/#contact$/);
    });
  }

  test("the privacy policy says what the product really does", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByText(/do not currently send your code or your data to an AI model provider/)).toBeVisible();
    await expect(page.getByText(/delete the copy when the scan ends/)).toBeVisible();
    await expect(page.getByRole("cell", { name: "Neon" })).toBeVisible();
  });
});

test("the sign-in page does not offer GitHub until it is set up, and offers the development form", async ({ page }) => {
  await page.goto("/signin");
  await expect(page.getByRole("button", { name: /Continue with GitHub/ })).toBeDisabled();
  await expect(page.getByText(/GitHub sign-in is not set up yet/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Dev sign in" })).toBeVisible();
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
  await expect(main.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
});

test("protected pages and the API send a signed-out visitor to sign in", async ({ page, request }) => {
  for (const path of ["/account", "/history", "/account/delete", "/scan/5f0a64c4-62d6-4b9b-8e0e-7b6f5c2f6d11"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/signin/);
  }
  for (const path of ["/api/me", "/api/me/export", "/api/scans", "/api/orders"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(401);
    expect((await res.json()).error.code).toBe("unauthorized");
  }
});