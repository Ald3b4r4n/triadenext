import { expect, test } from "@playwright/test";

test("public products page renders a published product", async ({ page }) => {
  await page.goto("/produtos", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Produto publicado de exemplo", exact: true })
  ).toBeVisible();
  await expect(page.getByText("Produto sem estoque de exemplo")).toHaveCount(0);
});

test("admin products pages are blocked without auth real", async ({ page }) => {
  await page.goto("/admin/produtos", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Acesso bloqueado" })).toBeVisible();
});
