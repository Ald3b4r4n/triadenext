import { expect, test } from "@playwright/test";

test("home renders reconstruction placeholder", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.getByRole("heading", { name: "Storefront" })).toBeVisible();
  await expect(page.getByText("handoff do Reversa")).toBeVisible();
});
