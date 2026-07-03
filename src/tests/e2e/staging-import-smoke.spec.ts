import { expect, test } from "@playwright/test";

const stagingSmokeUrl = process.env.STAGING_IMPORT_SMOKE_URL;

test.describe("staging import post-import smoke", () => {
  test.skip(!stagingSmokeUrl, "STAGING_IMPORT_SMOKE_URL ausente; smoke remoto fica pendente.");

  test("checks the imported storefront and protected surfaces on a non-production URL", async ({ page }) => {
    const baseUrl = new URL(stagingSmokeUrl ?? "http://127.0.0.1:3000");
    expect(baseUrl.hostname).not.toBe("triadeessenzaparfum.com.br");

    await page.goto(baseUrl.toString(), { waitUntil: "commit" });
    await expect(page.getByRole("link", { name: "Tríade Essenza Parfum" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
    await expect(page.getByText(/DATABASE_URL|STRIPE_SECRET|secret|token/i)).toHaveCount(0);

    await page.goto(new URL("/produtos", baseUrl).toString(), { waitUntil: "commit" });
    await expect(page.getByRole("heading", { name: /Produtos|Catalogo|Catálogo/i })).toBeVisible();

    await page.goto(new URL("/carrinho", baseUrl).toString(), { waitUntil: "commit" });
    await expect(page.getByRole("heading", { name: "Carrinho" })).toBeVisible();

    await page.goto(new URL("/admin", baseUrl).toString(), { waitUntil: "commit" });
    await expect(page.getByText(/secret|token|DATABASE_URL/i)).toHaveCount(0);
  });
});
