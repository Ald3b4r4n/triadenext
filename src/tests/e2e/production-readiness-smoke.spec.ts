import { expect, test } from "@playwright/test";

test("production readiness smoke keeps the storefront flow safe and navigable", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });

  await expect(page.getByRole("link", { name: "Tríade Essenza Parfum" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
  await expect(page.getByText(/Reconstrucao|Placeholder funcional|DATABASE_URL|STRIPE_SECRET/i)).toHaveCount(
    0
  );

  await page.getByRole("link", { name: "Ver coleções" }).first().click();
  await expect(page).toHaveURL(/\/produtos/);
  await expect(page.getByRole("link", { name: "Essenza Gold", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Essenza Gold", exact: true }).click();
  await expect(page).toHaveURL(/\/produto\/essenza-gold/);
  await expect(page.getByRole("button", { name: "Adicionar ao carrinho" })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Carrinho", exact: true })
    .click();
  await expect(page).toHaveURL(/\/carrinho/);

  await expect(page.getByRole("heading", { name: "Carrinho" })).toBeVisible();
  await expect(page.getByText("Essenza Gold")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resumo" })).toBeVisible();
  await expect(page.getByText(/secret|token|DATABASE_URL/i)).toHaveCount(0);
});

test("production readiness smoke keeps protected areas blocked without real auth", async ({
  page
}) => {
  await page.goto("/checkout", { waitUntil: "commit" });
  await expect(page.locator('input[name*="card" i]')).toHaveCount(0);
  await expect(page.getByText(/Stripe|PaymentIntent|secret|token|DATABASE_URL/i)).toHaveCount(0);

  await page.goto("/pedidos", { waitUntil: "commit" });
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/admin", { waitUntil: "commit" });
  await expect(page.getByRole("heading", { name: "Acesso bloqueado" })).toBeVisible();
  await expect(page.getByText(/secret|token|DATABASE_URL/i)).toHaveCount(0);
});
