import { describe, expect, it } from "vitest";
import { formatProductPrice } from "@/features/products/utils";
import {
  isProductAvailableForPurchase,
  isProductPublic,
  normalizeProductSlug
} from "@/features/products/domain";
import { devProducts } from "@/features/products/dev/fixtures";

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
});
