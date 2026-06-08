import { describe, expect, it } from "vitest";
import {
  calculateCartSubtotalCents,
  calculateItemSubtotalCents,
  validatePurchasableProduct,
  validateQuantityForStock
} from "@/features/cart/domain";
import { devProducts } from "@/features/products/dev/fixtures";

const now = new Date("2026-06-08T12:00:00.000Z");

describe("cart domain", () => {
  it("calculates item and cart subtotal in cents", () => {
    expect(calculateItemSubtotalCents(15990, 2)).toBe(31980);
    expect(
      calculateCartSubtotalCents([
        { unitPriceSnapshotCents: 15990, quantity: 2 },
        { unitPriceSnapshotCents: 9900, quantity: 1 }
      ])
    ).toBe(41880);
  });

  it("validates quantity against current stock", () => {
    expect(validateQuantityForStock(1, 2).status).toBe("valid");
    expect(validateQuantityForStock(0, 2).status).toBe("invalid");
    expect(validateQuantityForStock(3, 2)).toEqual({
      status: "insufficient_stock",
      maxQuantity: 2
    });
  });

  it("accepts only published, current and stocked products", () => {
    expect(validatePurchasableProduct(devProducts[0], now).status).toBe("available");
    expect(
      validatePurchasableProduct(
        devProducts.find((product) => product.id === "prod-example-draft")!,
        now
      ).status
    ).toBe("product_unavailable");
    expect(
      validatePurchasableProduct(
        devProducts.find((product) => product.id === "prod-example-inactive")!,
        now
      ).status
    ).toBe("product_unavailable");
    expect(
      validatePurchasableProduct(
        devProducts.find((product) => product.id === "prod-example-future")!,
        now
      ).status
    ).toBe("product_unavailable");
    expect(
      validatePurchasableProduct(
        devProducts.find((product) => product.id === "prod-example-out-of-stock")!,
        now
      ).status
    ).toBe("product_unavailable");
  });
});
