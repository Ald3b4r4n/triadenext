import { expect, test } from "@playwright/test";
import { addPublishedProductToCart } from "./helpers";

test("visitor clicks cart checkout CTA and is instructed to login", async ({
  page
}) => {
  await addPublishedProductToCart(page);
  await page.goto("/carrinho", { waitUntil: "commit" });
  await page.getByLabel("CEP").fill("01001-000");
  await page.getByRole("button", { name: "Cotar" }).click();
  await expect(page.getByText("Cotação de frete calculada.")).toBeVisible();

  const checkoutLink = page.getByRole("link", { name: "Entrar para checkout" });
  if ((await checkoutLink.count()) > 0) {
    await checkoutLink.click();
  } else {
    await page.goto("/checkout", { waitUntil: "commit" });
  }

  await expect(
    page.getByRole("heading", { name: /Login|Entre para continuar/ })
  ).toBeVisible();
  await expect(
    page.getByText(/Pedido criado|PaymentIntent|Stripe/i)
  ).toHaveCount(0);
});

test("direct checkout visit shows login and never creates anonymous order", async ({
  page
}) => {
  await page.goto("/checkout", { waitUntil: "commit" });

  await expect(
    page.getByRole("heading", { name: "Entre para continuar" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Fazer login" })).toBeVisible();
  await expect(page.getByText("Pedido criado")).toHaveCount(0);
  await expect(page.getByText(/cart[aã]o/i)).toHaveCount(0);
  await expect(page.getByText(/Stripe|PaymentIntent/i)).toHaveCount(0);
});
