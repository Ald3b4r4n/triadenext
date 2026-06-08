import { describe, expect, it } from "vitest";
import { formatProductPrice } from "@/features/products/utils";
import {
  isProductAvailableForPurchase,
  isProductPublic,
  normalizeProductSlug,
  parsePriceToCents
} from "@/features/products/domain";
import { devProducts } from "@/features/products/dev/fixtures";
import { productFormSchema } from "@/features/products/schemas";

const now = new Date("2026-06-08T12:00:00.000Z");

describe("products domain", () => {
  it("treats published products with past publishedAt and stock as public", () => {
    const product = devProducts.find((item) => item.id === "prod-example-published");

    expect(product).toBeDefined();
    expect(isProductPublic(product!, now)).toBe(true);
    expect(isProductAvailableForPurchase(product!, now)).toBe(true);
  });

  it("does not make out-of-stock products available", () => {
    const product = devProducts.find((item) => item.id === "prod-example-out-of-stock");

    expect(product).toBeDefined();
    expect(isProductAvailableForPurchase(product!, now)).toBe(false);
  });

  it("does not expose future published products", () => {
    const product = devProducts.find((item) => item.id === "prod-example-future");

    expect(product).toBeDefined();
    expect(isProductPublic(product!, now)).toBe(false);
  });

  it("does not expose draft products", () => {
    const product = {
      ...devProducts[0],
      id: "prod-draft",
      status: "draft" as const
    };

    expect(isProductPublic(product, now)).toBe(false);
  });

  it("does not expose inactive products while validation is pending", () => {
    const product = devProducts.find((item) => item.id === "prod-example-inactive");

    expect(product).toBeDefined();
    expect(isProductPublic(product!, now)).toBe(false);
  });

  it("normalizes accented text into a stable slug", () => {
    expect(normalizeProductSlug("Perfume Âmbar & Íris 100 ml")).toBe(
      "perfume-ambar-iris-100-ml"
    );
  });

  it("formats cents as BRL", () => {
    expect(formatProductPrice(15990)).toBe("R$ 159,90");
  });

  it("converts BRL text prices to cents", () => {
    expect(parsePriceToCents("159,90")).toBe(15990);
    expect(parsePriceToCents("R$ 1.234,56")).toBe(123456);
  });

  it("validates product form and normalizes slug", () => {
    const parsed = productFormSchema.safeParse({
      name: "Produto Âmbar de Teste",
      slug: "",
      shortDescription: "",
      description: "",
      brand: "",
      inspirationName: "",
      gender: "unissex",
      concentration: "",
      volumeMl: "100",
      sku: "TEST-001",
      price: "199,90",
      compareAtPrice: "",
      costPrice: "",
      stockQuantity: "3",
      lowStockThreshold: "1",
      status: "draft",
      isFeatured: "false",
      publishedAt: "",
      seoTitle: "",
      seoDescription: "",
      categoryIds: ["cat-example-active"]
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.slug).toBe("produto-ambar-de-teste");
    expect(parsed.success && parsed.data.priceCents).toBe(19990);
  });

  it("rejects invalid published admin data", () => {
    const parsed = productFormSchema.safeParse({
      name: "Produto publicado invalido",
      slug: "produto-publicado-invalido",
      shortDescription: "",
      description: "",
      brand: "",
      inspirationName: "",
      gender: "unissex",
      concentration: "",
      volumeMl: "",
      sku: "TEST-002",
      price: "199,90",
      compareAtPrice: "",
      costPrice: "",
      stockQuantity: "0",
      lowStockThreshold: "1",
      status: "published",
      isFeatured: "false",
      publishedAt: "2099-01-10T12:00",
      seoTitle: "",
      seoDescription: "",
      categoryIds: []
    });

    expect(parsed.success).toBe(false);
  });
});
