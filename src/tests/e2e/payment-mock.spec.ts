import { expect, test } from "@playwright/test";

test("payment page does not expose custom card or secret fields to visitors", async ({ page }) => {
  await page.goto("/pedidos/example/pagamento", { waitUntil: "commit" });

  await expect(page.locator('input[name*="secret" i]')).toHaveCount(0);
  await expect(page.locator('input[name*="stripe_secret" i]')).toHaveCount(0);
  await expect(page.locator('input[name*="card_number" i]')).toHaveCount(0);
  await expect(
    page.getByText(/Pedido indisponivel|Concluir pagamento|Entre para continuar|Login/)
  ).toBeVisible();
});
