import { expect, test } from "@playwright/test";
import {
  expectAdminProtected,
  findPublishedProduct,
  openPublishedProduct
} from "./helpers";

test("public products page renders a published product", async ({ page }) => {
  const product = await findPublishedProduct(page);

  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
  await expect(
    page.getByText("Vitrine da loja com fragrâncias selecionadas")
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: product.name, exact: true })
  ).toBeVisible();
  await expect(page.getByText("Amber Nuit")).toHaveCount(0);
});

test("visitor can move from catalog to product detail and cart", async ({
  page
}) => {
  const product = await openPublishedProduct(page);

  await expect(page).toHaveURL(/\/produto\//);
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  await expect(page.getByText("Disponível")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Adicionar ao carrinho" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Carrinho", exact: true })
    .click();

  await expect(page).toHaveURL(/\/carrinho/);
  await expect(page.getByText(product.name)).toBeVisible();
});

test("admin products pages are blocked without auth real", async ({ page }) => {
  await page.goto("/admin/produtos", { waitUntil: "commit" });

  await expectAdminProtected(page);
});
