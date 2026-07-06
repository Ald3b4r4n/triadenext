import { expect, test } from "@playwright/test";
import { expectAdminProtected } from "./helpers";

const storefrontRoutes = ["/", "/produtos", "/carrinho", "/login"];
const breakpoints = [
  { width: 360, height: 800 },
  { width: 430, height: 900 },
  { width: 768, height: 1024 },
  { width: 1366, height: 900 }
];

test("storefront routes do not overflow horizontally on required breakpoints", async ({
  page
}) => {
  for (const viewport of breakpoints) {
    await page.setViewportSize(viewport);

    for (const route of storefrontRoutes) {
      await page.goto(route, { waitUntil: "commit" });
      await expect(page.locator("body")).toBeVisible();
      await expect(
        page.getByText(/Reconstrucao|Placeholder funcional|DATABASE_URL/i)
      ).toHaveCount(0);

      const hasHorizontalOverflow = await page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth > root.clientWidth + 1;
      });

      expect(hasHorizontalOverflow, `${route} at ${viewport.width}px`).toBe(
        false
      );
    }
  }
});

test("admin remains protected and stable on desktop width", async ({
  page
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/admin/produtos", { waitUntil: "commit" });

  await expectAdminProtected(page);

  const hasHorizontalOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });

  expect(hasHorizontalOverflow).toBe(false);
});
