import { expect, test } from "@playwright/test";

test("customer orders remain guarded for visitors", async ({ page }) => {
  await page.goto("/pedidos", { waitUntil: "commit" });

  await expect(page).toHaveURL(/\/login/);
});

test("admin pending orders list is blocked without real database auth", async ({ page }) => {
  await page.goto("/admin/pedidos", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Acesso bloqueado" })).toBeVisible();
  await expect(page.getByText("Operação administrativa indisponível neste ambiente.")).toBeVisible();
  await expect(page.getByText(/DATABASE_URL|secret|token/i)).toHaveCount(0);
});
