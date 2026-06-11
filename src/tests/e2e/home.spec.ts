import { expect, test } from "@playwright/test";

test("home renders a functional public storefront", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });

  await expect(page.getByText("Reconstrucao em andamento")).toHaveCount(0);
  await expect(page.getByText(/Placeholder funcional/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Tríade Essenza Parfum" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver produtos" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Carrinho", exact: true })).toBeVisible();
  await expect(page.getByText("Produto publicado de exemplo")).toBeVisible();
  await expect(page.getByText("Produto sem estoque de exemplo")).toHaveCount(0);
});
