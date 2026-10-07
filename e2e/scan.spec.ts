import { approveOrder, expect, removeAccount, signInAs, test, uniqueHandle } from "./fixtures";
import { NETWORK_TESTS } from "./support/env";

// These tests clone a real public repository from GitHub, so they are slow and need the network.
// Run them with: pnpm e2e:network
test.skip(!NETWORK_TESTS, "set E2E_NETWORK=1 (pnpm e2e:network) to run the scans against GitHub");
test.setTimeout(180_000);

const REPO = "github.com/vercel/nextjs-subscription-payments";

test("a scan runs to a report, the free report is locked, and a pass unlocks it", async ({ page, context, account }) => {
  expect(account.userId).toBeTruthy();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByLabel("GitHub repository or website").first().fill(REPO);
  await page.getByRole("button", { name: "Run a check" }).first().click();

  // Progress, then the report with a verdict stamp.
  await expect(page).toHaveURL(/\/scan\/[0-9a-f-]{36}/);
  await expect(page.getByText("Reading your repository")).toBeVisible();
  const report = page.getByRole("article");
  await expect(report.getByRole("heading", { level: 2 })).toContainText("nextjs-subscription-payments", { timeout: 120_000 });
  await expect(report.getByRole("img", { name: /Verdict:/ })).toBeVisible();

  // All four tabs exist, and the checks that were built last are among the ones that ran.
  for (const tab of ["All", "Security", "Testing", "Quality", "Legal"]) await expect(report.getByRole("tab", { name: new RegExp(tab) })).toBeVisible();

  // Free tier: two findings are complete, the rest show only a title and a place, decided on the server.
  await expect(report.getByText("Details are part of a project pass").first()).toBeVisible();
  const scanId = page.url().split("/").pop()!;
  const free = await (await page.request.get(`/api/scans/${scanId}/report`)).json();
  expect(free.access.tier).toBe("free");
  const locked = free.findings.filter((f: { locked?: boolean }) => f.locked);
  expect(locked.length).toBeGreaterThan(0);
  for (const f of locked) {
    expect(f.explanation).toBe("");
    expect(f.fix_prompt).toBe("");
  }
  expect(JSON.stringify(free)).not.toContain("sk_live"); // no secret ever reaches the browser

  // A fix prompt of an unlocked finding can be copied.
  await report.getByRole("button", { name: "Copy fix prompt" }).first().click();
  await expect(report.getByRole("button", { name: "Copied" })).toBeVisible();

  // The scan is in the history.
  await page.goto("/history");
  await expect(page.getByRole("link", { name: /nextjs-subscription-payments/ })).toBeVisible();

  // Buy and approve a pass for the repository: the same report is now complete.
  await page.goto(`/pricing?repo=${encodeURIComponent("vercel/nextjs-subscription-payments")}`);
  await page.getByRole("button", { name: "Get a project pass" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your order" })).toBeVisible();
  const orders = await (await page.request.get("/api/orders")).json();
  await approveOrder(orders.orders[0].id);

  await page.goto(`/scan/${scanId}`);
  await expect(page.getByRole("article").getByRole("heading", { level: 2 })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Details are part of a project pass")).toHaveCount(0);
  const paid = await (await page.request.get(`/api/scans/${scanId}/report`)).json();
  expect(paid.access.tier).toBe("paid");
  expect(paid.findings.every((f: { explanation: string; fix_prompt: string }) => f.explanation && f.fix_prompt)).toBe(true);
});

test("the second scan is refused while one is still running, and another person cannot read the report", async ({ page, browser, account }) => {
  expect(account.userId).toBeTruthy();
  await page.goto("/");
  const first = await page.request.post("/api/scans", { data: { repo_url: REPO }, headers: { "Idempotency-Key": "e2e-first-0001" } });
  expect(first.status()).toBe(202);
  const { id } = await first.json();

  const again = await page.request.post("/api/scans", { data: { repo_url: "github.com/vercel/next.js" }, headers: { "Idempotency-Key": "e2e-second-0002" } });
  expect(again.status()).toBe(409);
  expect((await again.json()).error.code).toBe("scan_in_progress");

  // The same key returns the same scan instead of starting another.
  const replay = await page.request.post("/api/scans", { data: { repo_url: REPO }, headers: { "Idempotency-Key": "e2e-first-0001" } });
  expect(replay.status()).toBe(200);
  expect((await replay.json()).id).toBe(id);

  // A stranger gets a 404, not a 403: the scan does not exist for them.
  const other = await browser.newContext();
  const stranger = await other.newPage();
  const who = await signInAs(stranger, uniqueHandle("stranger"));
  try {
    expect((await stranger.request.get(`/api/scans/${id}`)).status()).toBe(404);
    expect((await stranger.request.get(`/api/scans/${id}/report`)).status()).toBe(404);
  } finally {
    await removeAccount(who.userId);
    await other.close();
  }
});