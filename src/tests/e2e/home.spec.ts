import { expect, test } from "@playwright/test";

test("home renders a functional public storefront", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });

  await expect(page.getByText("Reconstrucao em andamento")).toHaveCount(0);
  await expect(page.getByText(/Placeholder funcional/)).toHaveCount(0);
  await expect(page.getByText(/^Storefront$/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Tríade Essenza Parfum" })).toBeVisible();
  const mainNav = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(mainNav).toBeVisible();
  await expect(page.getByRole("link", { name: "Comprar agora" })).toBeVisible();
  await expect(mainNav.getByRole("link", { name: "Carrinho", exact: true })).toBeVisible();
  await expect(page.getByText("Perfumes que vestem presença.")).toBeVisible();
  await expect(page.getByText("Essenza Gold")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("Perfumes importados");
  await expect(page.getByText("Amber Nuit")).toHaveCount(0);
});
