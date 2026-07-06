import { expect, test } from "@playwright/test";

test("customer surfaces redirect to login when anonymous", async ({ page }) => {
  await page.goto("/minha-conta", { waitUntil: "commit" });

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(
    page.getByText("Acesse sua conta para continuar em áreas protegidas.")
  ).toBeVisible();
  await expect(
    page.getByText(/Reconstrucao|Placeholder funcional|DATABASE_URL/i)
  ).toHaveCount(0);
});

test("customer-related pages remain guarded", async ({ page }) => {
  await page.goto("/enderecos", { waitUntil: "commit" });
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/cadastro", { waitUntil: "commit" });
  await expect(
    page.getByRole("heading", { name: "Criar conta" })
  ).toBeVisible();
  await expect(
    page.getByText("O cadastro público cria somente perfil de cliente.")
  ).toBeVisible();
});
