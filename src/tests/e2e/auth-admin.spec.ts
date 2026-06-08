import { expect, test } from "@playwright/test";

test("admin remains blocked without login", async ({ page }) => {
  await page.goto("/admin/produtos", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Acesso bloqueado" })).toBeVisible();
  await expect(page.getByText("DATABASE_URL ausente")).toBeVisible();
});
