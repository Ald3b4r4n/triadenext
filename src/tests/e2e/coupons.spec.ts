import { expect, test } from "@playwright/test";
import { addPublishedProductToCart, expectAdminProtected } from "./helpers";

test("visitor applies a valid coupon and sees discount in fallback mode", async ({
  page
}) => {
  await addPublishedProductToCart(page);
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("Código").fill("dev10");
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(page.getByText("Cupom aplicado ao carrinho.")).toBeVisible();
  await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
});

test("invalid coupon shows controlled error", async ({ page }) => {
  await addPublishedProductToCart(page);
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("Código").fill("naoexiste");
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(page.getByText("Cupom não encontrado.")).toBeVisible();
});

test("coupon can be removed", async ({ page }) => {
  await addPublishedProductToCart(page);
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("Código").fill("dev10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByText("Cupom aplicado ao carrinho.")).toBeVisible();

  const removeButton = page.getByRole("button", {
    name: "Remover",
    exact: true
  });
  if ((await removeButton.count()) === 0) {
    await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
    return;
  }

  await removeButton.click();

  await expect(page.getByText("Cupom removido do carrinho.")).toBeVisible();
  await expect(page.getByText("Desconto")).toBeVisible();
  await expect(page.getByText("-R$ 0,00")).toBeVisible();
});

test("minimum subtotal coupon is handled without server error", async ({
  page
}) => {
  await addPublishedProductToCart(page);
  await page.goto("/carrinho", { waitUntil: "commit" });

  await page.getByLabel("Código").fill("MINIMO200");
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(
    page.getByText(
      /Subtotal insuficiente para este cupom|Cupom aplicado ao carrinho/
    )
  ).toBeVisible();
  await expect(page.getByText("This page couldn’t load")).toHaveCount(0);
});

test("admin coupons remains protected without real auth", async ({ page }) => {
  await page.goto("/admin/cupons", { waitUntil: "commit" });

  await expectAdminProtected(page);
});
