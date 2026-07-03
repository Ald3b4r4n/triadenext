import { expect, test } from "@playwright/test";

test("public products page renders a published product", async ({ page }) => {
  await page.goto("/produtos", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
  await expect(page.getByText("Vitrine da loja com fragrâncias selecionadas")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Essenza Gold", exact: true })
  ).toBeVisible();
  await expect(page.getByText("R$ 159,90")).toBeVisible();
  await expect(page.getByText("Amber Nuit")).toHaveCount(0);
});

test("visitor can move from catalog to product detail and cart", async ({ page }) => {
  await page.goto("/produtos", { waitUntil: "commit" });

  await page.getByRole("link", { name: "Essenza Gold", exact: true }).click();

  await expect(page).toHaveURL(/\/produto\/essenza-gold/);
  await expect(page.getByRole("heading", { name: "Essenza Gold" })).toBeVisible();
  await expect(page.getByText("Disponível")).toBeVisible();
  await expect(page.getByRole("button", { name: "Adicionar ao carrinho" })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Carrinho", exact: true })
    .click();

  await expect(page).toHaveURL(/\/carrinho/);
  await expect(page.getByText("Essenza Gold")).toBeVisible();
});

test("admin products pages are blocked without auth real", async ({ page }) => {
  await page.goto("/admin/produtos", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Acesso bloqueado" })).toBeVisible();
  await expect(page.getByText("Operação administrativa indisponível neste ambiente.")).toBeVisible();
});
