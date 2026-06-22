import { expect, test } from "@playwright/test";

test("visitor applies a valid coupon and sees discount in fallback mode", async ({ page }) => {
  await page.goto("/produto/produto-publicado-de-exemplo", { waitUntil: "commit" });
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("Código").fill("dev10");
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(page.getByText("Cupom aplicado ao carrinho.")).toBeVisible();
  await expect(page.getByText("DEV10")).toBeVisible();
  await expect(page.getByText("-R$ 15,99")).toBeVisible();
  await expect(page.getByText("Total parcial").locator("..").getByText("R$ 143,91")).toBeVisible();
});

test("invalid coupon shows controlled error", async ({ page }) => {
  await page.goto("/produto/produto-publicado-de-exemplo", { waitUntil: "commit" });
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("Código").fill("naoexiste");
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(page.getByText("Cupom não encontrado.")).toBeVisible();
});

test("coupon can be removed", async ({ page }) => {
  await page.goto("/produto/produto-publicado-de-exemplo", { waitUntil: "commit" });
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("Código").fill("dev10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByText("DEV10")).toBeVisible();
  await page.getByRole("button", { name: "Remover", exact: true }).click();

  await expect(page.getByText("Cupom removido do carrinho.")).toBeVisible();
  await expect(page.getByText("Desconto")).toBeVisible();
  await expect(page.getByText("-R$ 0,00")).toBeVisible();
});

test("minimum subtotal coupon is blocked", async ({ page }) => {
  await page.goto("/produto/produto-publicado-de-exemplo", { waitUntil: "commit" });
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("Código").fill("MINIMO200");
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(page.getByText("Subtotal insuficiente para este cupom.")).toBeVisible();
});

test("admin coupons remains protected without real auth", async ({ page }) => {
  await page.goto("/admin/cupons", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Acesso bloqueado" })).toBeVisible();
  await expect(page.getByText("Operação administrativa indisponível neste ambiente.")).toBeVisible();
  await expect(page.getByText(/DATABASE_URL|secret|token/i)).toHaveCount(0);
});
