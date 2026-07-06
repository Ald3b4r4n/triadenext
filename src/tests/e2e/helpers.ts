import { expect, type Page } from "@playwright/test";

const knownPublishedProducts = [
  "Bidaya Gris",
  "Essenza Gold",
  "Khadlaj Island Dreams",
  "Rayhaan Lion"
];

export async function expectAdminProtected(page: Page) {
  await expect(
    page.getByRole("heading", { name: /Login|Acesso bloqueado/ })
  ).toBeVisible();
  await expect(page.getByText(/DATABASE_URL|secret|token/i)).toHaveCount(0);
}

export async function findPublishedProduct(page: Page) {
  await page.goto("/produtos", { waitUntil: "commit" });

  for (const name of knownPublishedProducts) {
    const link = page.getByRole("link", { name, exact: true }).first();
    if ((await link.count()) > 0) {
      await expect(link).toBeVisible();
      return { name, href: (await link.getAttribute("href")) ?? "/produtos" };
    }
  }

  const link = page
    .locator('a[href^="/produto/"]')
    .filter({ hasText: /\S/ })
    .first();
  await expect(link).toBeVisible();

  return {
    name: (await link.innerText()).trim(),
    href: (await link.getAttribute("href")) ?? "/produtos"
  };
}

export async function openPublishedProduct(page: Page) {
  const product = await findPublishedProduct(page);
  await page.goto(product.href, { waitUntil: "commit" });
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  return product;
}

export async function addPublishedProductToCart(page: Page) {
  const product = await openPublishedProduct(page);
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await page.waitForLoadState("networkidle");
  return product;
}
