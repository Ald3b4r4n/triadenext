import { expect, test } from "@playwright/test";
import { addPublishedProductToCart } from "./helpers";

test("visitor quotes a manual shipping option by CEP", async ({ page }) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();

  await expect(
    page.getByRole("heading", { name: "Frete manual" })
  ).toBeVisible();
  await expect(page.getByText("Cotação de frete calculada.")).toBeVisible();
  await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
});

test("visitor selects manual freight and sees total with shipping", async ({
  page
}) => {
  await addPublishedProductToCart(page);
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();

  await expect(page.getByText("Cotação de frete calculada.")).toBeVisible();
  await expect(page.getByText("Total com frete")).toBeVisible();
  await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
});

test("free shipping coupon zeroes eligible manual freight", async ({
  page
}) => {
  await addPublishedProductToCart(page);
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();
  await page.getByLabel("Código").fill("FRETEGRATIS");
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(
    page.getByText(/Cupom aplicado ao carrinho|Cupom de frete grátis/)
  ).toBeVisible();
  await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
});

test("postal code without coverage shows controlled error", async ({
  page
}) => {
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("CEP").fill("99999-999");
  await page.getByRole("button", { name: "Cotar" }).click();

  await expect(
    page.getByText("Não há cobertura manual para este CEP.")
  ).toBeVisible();
});
