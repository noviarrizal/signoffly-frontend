import { expect, test } from "./fixtures";
import { NETWORK_TESTS } from "./support/env";

// Addresses that point at the server's own network must be refused by the whole stack, and nothing may be created.
test("addresses that point inward are refused, and nothing is started", async ({ page, account }) => {
  expect(account.userId).toBeTruthy();
  await page.goto("/");
  const bad = [
    "http://169.254.169.254/latest/meta-data/",
    "http://127.0.0.1",
    "http://localhost:80",
    "http://[::1]/",
    "http://2130706433/",
    "https://user:pass@example.com",
    "https://printer.local",
    "https://example.com:8080",
    "ftp://example.com",
  ];
  for (const [i, repo_url] of bad.entries()) {
    const res = await page.request.post("/api/scans", { data: { repo_url }, headers: { "Idempotency-Key": `e2e-inward-${String(i).padStart(4, "0")}` } });
    expect(res.status(), repo_url).toBe(400);
    const code = (await res.json()).error.code;
    expect(["invalid_repo_url", "live_site_not_supported"], `${repo_url} -> ${code}`).toContain(code);
  }
  const me = await (await page.request.get("/api/me")).json();
  expect(me.site_quota.used).toBe(0); // refused before any work, so no check was used
  const history = await (await page.request.get("/api/scans")).json();
  expect(history.scans ?? []).toHaveLength(0);
});

test("the scan box says in words when an address is not a website", async ({ page, account }) => {
  expect(account.userId).toBeTruthy();
  await page.goto("/");
  await page.getByLabel("GitHub repository or website").first().fill("https://printer.local");
  await page.getByRole("button", { name: "Run a check" }).first().click();
  await expect(page.getByRole("alert").filter({ hasText: "does not look like a GitHub repository link or a public website address" })).toBeVisible();
});

test.describe("with the network", () => {
  test.skip(!NETWORK_TESTS, "set E2E_NETWORK=1 (pnpm e2e:network) to check a real website");
  test.setTimeout(120_000);

  test("a website check runs to a report from the outside, and shows every finding", async ({ page, account }) => {
    expect(account.userId).toBeTruthy();
    await page.goto("/");
    await page.getByLabel("GitHub repository or website").first().fill("https://example.com/some/page?token=abc");
    await page.getByRole("button", { name: "Run a check" }).first().click();

    await expect(page).toHaveURL(/\/scan\/[0-9a-f-]{36}/);
    const report = page.getByRole("article");
    await expect(report.getByRole("heading", { level: 2 })).toHaveText("example.com", { timeout: 90_000 });
    await expect(report.getByText("This is a check from the outside")).toBeVisible();
    await expect(report.getByText("What this check could not see")).toBeVisible();
    await expect(report.getByText(/Connect the repository|cannot sign this off|Fix \w+ first/).first()).toBeVisible();
    await expect(report.getByRole("tab")).toHaveCount(3);
    await expect(report.getByText("Details are part of a project pass")).toHaveCount(0);

    const id = page.url().split("/").pop()!;
    const json = await (await page.request.get(`/api/scans/${id}/report`)).json();
    expect(json.kind).toBe("site");
    expect(json.complete).toBe(false);
    expect(json.verdict).not.toBe("signed_off");
    expect(json.repo.owner).toBe("");
    expect(json.access.locked_findings).toBe(0);
    expect(JSON.stringify(json)).not.toContain("token=abc"); // only the host is ever kept

    await page.goto("/history");
    await expect(page.getByRole("link", { name: /example\.com/ })).toBeVisible();
    await expect(page.getByText("Website", { exact: true })).toBeVisible();
  });
});