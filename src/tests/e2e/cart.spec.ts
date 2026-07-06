import { expect, test } from "@playwright/test";
import { addPublishedProductToCart } from "./helpers";

test("visitor sees an empty cart without a real database", async ({ page }) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Carrinho" })).toBeVisible();
  await expect(page.getByText("Nenhum item adicionado")).toBeVisible();
  await expect(page.getByText("Escolha um produto publicado")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver produtos" })).toBeVisible();
});

test("visitor can add a valid product in fallback mode", async ({ page }) => {
  const product = await addPublishedProductToCart(page);

  await page.goto("/carrinho", { waitUntil: "commit" });
  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();
  await expect(page.getByText("Cotação de frete calculada.")).toBeVisible();

  await expect(page.getByText(product.name)).toBeVisible();
  await expect(page.getByText("Subtotal do item:")).toBeVisible();
  await expect(
    page
      .getByRole("link", { name: "Entrar para checkout" })
      .or(page.getByRole("button", { name: "Selecione itens e frete" }))
  ).toBeVisible();
});

test("unavailable products are not exposed as purchasable", async ({
  page
}) => {
  await page.goto("/produtos", { waitUntil: "commit" });

  await expect(page.getByText("Amber Nuit")).toHaveCount(0);
  await expect(page.getByText("Oud Royal")).toHaveCount(0);
  await expect(page.getByText("Noir Archive")).toHaveCount(0);
});

test("cart page continues to load without real database", async ({ page }) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Resumo" })).toBeVisible();
  await expect(
    page.getByText("O pedido é criado na próxima etapa")
  ).toBeVisible();
});
