import { expect, test } from "@playwright/test";

test("visitor sees an empty cart without a real database", async ({ page }) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Carrinho" })).toBeVisible();
  await expect(page.getByText("Nenhum item adicionado")).toBeVisible();
  await expect(page.getByText("Carrinho ativo apenas para teste local")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver produtos" })).toBeVisible();
});

test("visitor can add a valid product in fallback mode", async ({ page }) => {
  await page.goto("/produto/produto-publicado-de-exemplo", { waitUntil: "commit" });

  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto("/carrinho", { waitUntil: "commit" });
  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();
  await expect(page.getByText("Cotação de frete calculada.")).toBeVisible();

  await expect(page.getByText("Produto publicado de exemplo")).toBeVisible();
  await expect(page.getByText("Subtotal do item: R$ 159,90")).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar para checkout" })).toBeVisible();
});

test("unavailable products are not exposed as purchasable", async ({ page }) => {
  await page.goto("/produtos", { waitUntil: "commit" });

  await expect(page.getByText("Produto sem estoque de exemplo")).toHaveCount(0);
  await expect(page.getByText("Produto futuro de exemplo")).toHaveCount(0);
  await expect(page.getByText("Produto inativo de exemplo")).toHaveCount(0);
});

test("cart page continues to load without real database", async ({ page }) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Resumo" })).toBeVisible();
  await expect(page.getByText("O pedido é criado na próxima etapa")).toBeVisible();
});
