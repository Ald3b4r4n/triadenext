import { expect, test } from "@playwright/test";

test("login and signup pages render controlled auth forms", async ({
  page
}) => {
  await page.goto("/login", { waitUntil: "commit" });
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByLabel("Senha")).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar conta" })).toBeVisible();

  await page.goto("/cadastro", { waitUntil: "commit" });
  await expect(
    page.getByRole("heading", { name: "Criar conta" })
  ).toBeVisible();
  await expect(page.getByLabel("Nome")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByLabel("Senha")).toBeVisible();
  await expect(page.getByLabel("Confirmar senha")).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
});
