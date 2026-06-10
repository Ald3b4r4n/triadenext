import { expect, test } from "@playwright/test";

test("visitor clicks cart checkout CTA and is instructed to login", async ({ page }) => {
  await page.goto("/produto/produto-publicado-de-exemplo", { waitUntil: "commit" });
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto("/carrinho", { waitUntil: "commit" });
  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();
  await expect(page.getByText("Cotacao de frete calculada.")).toBeVisible();

  await page.getByRole("link", { name: "Entrar para checkout" }).click();

  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcheckout|\/login\?returnTo=\/checkout/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

test("direct checkout visit shows login and never creates anonymous order", async ({ page }) => {
  await page.goto("/checkout", { waitUntil: "commit" });

  await expect(page.getByRole("heading", { name: "Entre para continuar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Fazer login" })).toBeVisible();
  await expect(page.getByText("Pedido criado")).toHaveCount(0);
  await expect(page.getByText(/cart[aã]o/i)).toHaveCount(0);
  await expect(page.getByText(/Stripe|PaymentIntent/i)).toHaveCount(0);
});
