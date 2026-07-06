import { test } from "@playwright/test";
import { expectAdminProtected } from "./helpers";

test("admin remains blocked without login", async ({ page }) => {
  for (const route of [
    "/admin",
    "/admin/produtos",
    "/admin/cupons",
    "/admin/frete",
    "/admin/pedidos"
  ]) {
    await page.goto(route, { waitUntil: "commit" });

    await expectAdminProtected(page);
  }
});
