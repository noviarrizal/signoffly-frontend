import { approveOrder, expect, test } from "./fixtures";

test("ordering a project pass, paying by hand and getting the pass", async ({ page, account }) => {
  expect(account.userId).toBeTruthy();
  await page.goto("/pricing?repo=acme%2Fshop");
  await expect(page.getByLabel("Repository for the pass")).toHaveValue("github.com/acme/shop");
  await page.getByRole("button", { name: "Get a project pass" }).click();

  const order = page.getByRole("status").filter({ hasText: "Your order" });
  await expect(order).toBeVisible();
  const reference = (await order.getByText(/^SO-[A-Z2-9]{6}$/).textContent())!;
  await expect(order.getByText(/^Rp149\.\d{3}$/)).toBeVisible(); // a unique amount, so a transfer can be matched
  await expect(order.getByText("Transfer to the test account.")).toBeVisible();

  // Asking again for the same repository shows the same unpaid order instead of piling up new ones.
  await page.goto("/pricing?repo=acme%2Fshop");
  await page.getByRole("button", { name: "Get a project pass" }).click();
  await expect(page.getByRole("status").filter({ hasText: reference })).toBeVisible();

  await page.goto("/account");
  await expect(page.getByText("Waiting for payment")).toBeVisible();
  await expect(page.getByText(reference)).toBeVisible();
  await expect(page.getByText("No active passes.")).toBeVisible();

  // The owner confirms the payment. Approving twice must still give one pass.
  const orders = await (await page.request.get("/api/orders")).json();
  expect(orders.orders).toHaveLength(1);
  await approveOrder(orders.orders[0].id);
  await approveOrder(orders.orders[0].id);

  await page.reload();
  await expect(page.getByText("Paid", { exact: true })).toBeVisible();
  await expect(page.getByText("acme/shop").first()).toBeVisible();
  await expect(page.getByText("No active passes.")).toHaveCount(0);
  const me = await (await page.request.get("/api/me")).json();
  expect(me.passes).toHaveLength(1);
  expect(me.passes[0].repo).toBe("acme/shop");
});

test("a link that is not a repository cannot be ordered", async ({ page, account }) => {
  expect(account.userId).toBeTruthy();
  await page.goto("/pricing");
  await page.getByLabel("Repository for the pass").fill("https://example.com");
  await page.getByRole("button", { name: "Get a project pass" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "A pass covers repositories, not websites" })).toBeVisible();
  expect((await (await page.request.get("/api/orders")).json()).orders ?? []).toHaveLength(0);
});