import { expect, test } from "@playwright/test";

test("home renders a functional public storefront", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });

  await expect(page.getByText("Reconstrucao em andamento")).toHaveCount(0);
  await expect(page.getByText(/Placeholder funcional/)).toHaveCount(0);
  await expect(page.getByText(/^Storefront$/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Tríade Essenza Parfum" })).toBeVisible();
  const mainNav = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(mainNav).toBeVisible();
  await expect(mainNav.getByRole("link", { name: /Admin/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver coleções" })).toBeVisible();
  await expect(mainNav.getByRole("link", { name: "Carrinho", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Perfumes importados que marcam presença." })
  ).toBeVisible();
  await expect(page.getByText("Essenza Gold")).toBeVisible();
  await expect(page.getByText("Amber Imperial")).toBeVisible();
  await expect(page.getByText("Noir Absolu")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("suporte@triadeessenzaparfum.com.br");
  await expect(page.getByRole("contentinfo")).toContainText("AR Software Development");
  await expect(page.getByRole("contentinfo")).toContainText("Cartões de crédito");
  await expect(page.getByText("Amber Nuit")).toHaveCount(0);
});
