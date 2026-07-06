import { test } from "@playwright/test";
import { expectAdminProtected } from "./helpers";

test("admin shipping is protected without real auth", async ({ page }) => {
  await page.goto("/admin/frete", { waitUntil: "commit" });

  await expectAdminProtected(page);
});
