import { expect, test } from "@playwright/test";

test("customer surfaces redirect to login when anonymous", async ({ page }) => {
  await page.goto("/minha-conta", { waitUntil: "commit" });

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

test("customer-related pages remain guarded", async ({ page }) => {
  await page.goto("/enderecos", { waitUntil: "commit" });
  await expect(page).toHaveURL(/\/login/);
});
