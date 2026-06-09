import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveCartActorMock } = vi.hoisted(() => ({
  resolveCartActorMock: vi.fn()
}));

vi.mock("@/features/cart/server/cart-session", () => ({
  resolveCartActor: resolveCartActorMock
}));

import {
  addItemToCart,
  applyCouponToActiveCart,
  quoteShippingForActiveCart
} from "@/features/cart/server/cart-service";

describe("cart shipping coupon", () => {
  beforeEach(() => {
    resolveCartActorMock.mockReset();
  });

  it("free_shipping zeroes only an existing manual freight amount", async () => {
    resolveCartActorMock.mockResolvedValue({ kind: "guest", guestToken: "guest-free-shipping" });

    await addItemToCart({ productId: "prod-example-published", quantity: 1 });
    const quoted = await quoteShippingForActiveCart({ postalCode: "01001-000" });
    expect(quoted.status === "fallback" && quoted.cart.shippingAmountCents).toBeGreaterThan(0);

    const applied = await applyCouponToActiveCart("FRETEGRATIS");

    expect(applied.status).toBe("fallback");
    expect(applied.status === "fallback" && applied.cart.coupon?.code).toBe("FRETEGRATIS");
    expect(applied.status === "fallback" && applied.cart.shippingAmountCents).toBe(0);
    expect(applied.status === "fallback" && applied.cart.discountCents).toBe(0);
  });
});
