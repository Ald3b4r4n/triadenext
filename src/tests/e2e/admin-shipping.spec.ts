import { expect, test } from "@playwright/test";

test("admin shipping is protected without real auth", async ({ page }) => {
  await page.goto("/admin/frete", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Acesso bloqueado" })).toBeVisible();
  await expect(page.getByText("Operação administrativa indisponível neste ambiente.")).toBeVisible();
  await expect(page.getByText(/DATABASE_URL|secret|token/i)).toHaveCount(0);
});
