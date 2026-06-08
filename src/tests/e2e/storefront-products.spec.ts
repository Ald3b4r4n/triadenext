import { expect, test } from "@playwright/test";

test("public products page renders a published product", async ({ page }) => {
  await page.goto("/produtos");

  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Produto publicado de exemplo", exact: true })
  ).toBeVisible();
  await expect(page.getByText("Produto sem estoque de exemplo")).toHaveCount(0);
});

test("admin products pages render management views", async ({ page }) => {
  await page.goto("/admin/produtos");

  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Novo produto" })).toBeVisible();

  await page.goto("/admin/produtos/novo");
  await expect(page.getByRole("heading", { name: "Novo produto" })).toBeVisible();
  await expect(page.getByLabel("Nome")).toBeVisible();
  await expect(page.getByLabel("SKU")).toBeVisible();
  await expect(page.getByLabel("Preco", { exact: true })).toBeVisible();

  await page.goto("/admin/produtos/prod-example-published/editar");
  await expect(page.getByRole("heading", { name: "Editar produto" })).toBeVisible();
  await expect(page.locator('input[name="name"]')).toHaveValue("Produto publicado de exemplo");
});
