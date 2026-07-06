import { expect, test } from "@playwright/test";

test("checkout surface has no card, Stripe, PaymentIntent or credential fields for visitors", async ({
  page
}) => {
  await page.goto("/checkout", { waitUntil: "commit" });

  await expect(page.locator('input[name*="card" i]')).toHaveCount(0);
  await expect(page.locator('input[name*="stripe" i]')).toHaveCount(0);
  await expect(page.locator('input[name*="payment" i]')).toHaveCount(0);
  await expect(page.getByText(/PaymentIntent|Stripe|credenciais/i)).toHaveCount(
    0
  );
});
