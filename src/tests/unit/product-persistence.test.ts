import { describe, expect, it, vi } from "vitest";
import {
  assertCanMutateRealData,
  getRuntimeMode,
  runtimeMessages
} from "@/lib/runtime-mode";
import {
  createAdminProduct,
  getAdminProductById,
  listAdminProducts,
  listPublicProducts
} from "@/features/products/server/product-service";

const validProductInput = {
  name: "Produto Persistencia Teste",
  slug: "produto-persistencia-teste",
  shortDescription: null,
  description: null,
  brand: null,
  inspirationName: null,
  gender: "unissex" as const,
  concentration: null,
  volumeMl: 100,
  sku: "TEST-PERSIST-001",
  priceCents: 19990,
  compareAtPriceCents: null,
  costPriceCents: null,
  stockQuantity: 3,
  lowStockThreshold: 1,
  status: "draft" as const,
  isFeatured: false,
  publishedAt: null,
  seoTitle: null,
  seoDescription: null,
  categoryIds: ["cat-example-active"]
};

describe("product persistence fallback", () => {
  it("uses explicit fixture mode when DATABASE_URL is absent", async () => {
    const mode = await getRuntimeMode();
    const products = await listAdminProducts();
    const product = await getAdminProductById("prod-example-published");

    expect(mode.hasDatabase).toBe(false);
    expect(mode.databaseNotice).toBe(runtimeMessages.databaseMissing);
    expect(products.some((item) => item.id === "prod-example-published")).toBe(true);
    expect(product?.slug).toBe("essenza-gold");
  });

  it("returns dev_fallback for admin mutation without exposing technical env names", async () => {
    const result = await createAdminProduct(validProductInput);

    expect(result.status).toBe("dev_fallback");
    expect(result.message).toContain("modo demonstrativo seguro");
    expect(result.message).not.toMatch(/DATABASE_URL|secret|token/i);
  });

  it("keeps storefront public rules while using fixtures", async () => {
    const products = await listPublicProducts(new Date("2026-06-08T12:00:00.000Z"));

    expect(products.map((product) => product.id)).toEqual(["prod-example-published"]);
  });

  it("blocks real mutations outside development/local-dev guardrail", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");

    expect(assertCanMutateRealData()).toEqual({
      allowed: false,
      message: runtimeMessages.blockedMutation
    });

    vi.unstubAllEnvs();
  });
});
