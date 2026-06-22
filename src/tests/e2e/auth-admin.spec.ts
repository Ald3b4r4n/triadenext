import { expect, test } from "@playwright/test";

test("admin remains blocked without login", async ({ page }) => {
  for (const route of ["/admin", "/admin/produtos", "/admin/cupons", "/admin/frete", "/admin/pedidos"]) {
    await page.goto(route, { waitUntil: "commit" });

    await expect(page.getByRole("heading", { name: "Acesso bloqueado" })).toBeVisible();
    await expect(page.getByText("Operação administrativa indisponível neste ambiente.")).toBeVisible();
    await expect(page.getByText(/DATABASE_URL|secret|token/i)).toHaveCount(0);
  }
});
