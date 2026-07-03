import { expect, test } from "@playwright/test";

const stagingSmokeUrl = process.env.STAGING_SMOKE_URL;

test.describe("staging smoke real readiness", () => {
  test.skip(!stagingSmokeUrl, "STAGING_SMOKE_URL ausente; smoke real fica pending-config.");

  test("checks storefront surfaces on an approved non-production URL", async ({ page }) => {
    const baseUrl = new URL(stagingSmokeUrl ?? "http://127.0.0.1:3000");
    expect(baseUrl.hostname).not.toBe("triadeessenzaparfum.com.br");
    expect(baseUrl.hostname).not.toBe("www.triadeessenzaparfum.com.br");

    await page.goto(baseUrl.toString(), { waitUntil: "commit" });
    await expect(page.getByRole("link", { name: "Tríade Essenza Parfum" })).toBeVisible();
    await expect(page.getByText(/Reconstrucao em andamento|Placeholder funcional/i)).toHaveCount(0);

    await page.goto(new URL("/produtos", baseUrl).toString(), { waitUntil: "commit" });
    await expect(page.getByRole("heading", { name: /Produtos|Catalogo|Catálogo/i })).toBeVisible();

    await page.goto(new URL("/carrinho", baseUrl).toString(), { waitUntil: "commit" });
    await expect(page.getByRole("heading", { name: "Carrinho" })).toBeVisible();

    await page.goto(new URL("/admin", baseUrl).toString(), { waitUntil: "commit" });
    await expect(page.getByText(/DATABASE_URL|STRIPE_SECRET|BLOB_READ_WRITE_TOKEN/i)).toHaveCount(0);
  });
});
