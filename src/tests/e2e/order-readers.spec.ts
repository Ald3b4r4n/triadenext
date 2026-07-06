import { expect, test } from "@playwright/test";
import { expectAdminProtected } from "./helpers";

test("customer orders remain guarded for visitors", async ({ page }) => {
  await page.goto("/pedidos", { waitUntil: "commit" });

  await expect(page).toHaveURL(/\/login/);
});

test("admin pending orders list is blocked without real database auth", async ({
  page
}) => {
  await page.goto("/admin/pedidos", { waitUntil: "commit" });

  await expectAdminProtected(page);
});
