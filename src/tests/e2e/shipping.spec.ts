import { expect, test, type Page } from "@playwright/test";

test("visitor quotes a manual shipping option by CEP", async ({ page }) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();

  await expect(page.getByRole("heading", { name: "Frete manual" })).toBeVisible();
  await expect(page.getByText(/Capital paulista expresso|Sudeste econômico/)).toBeVisible();
});

test("visitor selects manual freight and sees total with shipping", async ({ page }) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();

  await expect(page.getByText("Total com frete")).toBeVisible();
  await expect(page.getByText("Total com frete").locator("..").getByText("R$ 15,90")).toBeVisible();
});

test("free shipping coupon zeroes eligible manual freight", async ({ page }) => {
  await addPublishedProductToCart(page);
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();
  await page.getByLabel("Código").fill("FRETEGRATIS");
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(page.getByText("Cupom de frete grátis zerou o frete manual elegível.")).toBeVisible();
});

test("postal code without coverage shows controlled error", async ({ page }) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("CEP").fill("99999-999");
  await page.getByRole("button", { name: "Cotar" }).click();

  await expect(page.getByText("Não há cobertura manual para este CEP.")).toBeVisible();
});

async function addPublishedProductToCart(page: Page) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto("/produto/produto-publicado-de-exemplo", { waitUntil: "commit" });
    const button = page.getByRole("button", { name: "Adicionar ao carrinho" });
    if (await button.count()) {
      await button.click();
      await page.waitForLoadState("networkidle");
      return;
    }
    await page.waitForTimeout(1000);
  }

  await expect(page.getByRole("button", { name: "Adicionar ao carrinho" })).toBeVisible();
}
