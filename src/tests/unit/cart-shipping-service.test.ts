import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveCartActorMock } = vi.hoisted(() => ({
  resolveCartActorMock: vi.fn()
}));

vi.mock("@/features/cart/server/cart-session", () => ({
  resolveCartActor: resolveCartActorMock
}));

import {
  addItemToCart,
  quoteShippingForActiveCart,
  selectShippingOptionForActiveCart
} from "@/features/cart/server/cart-service";

describe("cart shipping service", () => {
  beforeEach(() => {
    resolveCartActorMock.mockReset();
  });

  it("quotes manual freight and adds it to cart total", async () => {
    resolveCartActorMock.mockResolvedValue({ kind: "guest", guestToken: "guest-shipping-service" });

    await addItemToCart({ productId: "prod-example-published", quantity: 1 });
    const result = await quoteShippingForActiveCart({ postalCode: "01001-000" });

    expect(result.status).toBe("fallback");
    expect(result.status === "fallback" && result.cart.shippingAmountCents).toBeGreaterThan(0);
    expect(result.status === "fallback" && result.cart.partialTotalWithShippingCents).toBeGreaterThan(
      result.status === "fallback" ? result.cart.partialTotalCents : 0
    );
  });

  it("blocks selecting a quote from another cart", async () => {
    resolveCartActorMock.mockResolvedValue({ kind: "guest", guestToken: "guest-quote-owner-a" });
    await addItemToCart({ productId: "prod-example-published", quantity: 1 });
    const quoteResult = await quoteShippingForActiveCart({ postalCode: "01001-000" });
    const quoteId = quoteResult.status === "fallback" ? quoteResult.cart.shippingQuoteId ?? "" : "";
    const optionId = quoteResult.status === "fallback" ? quoteResult.cart.shippingOptions[0]?.id ?? "" : "";

    resolveCartActorMock.mockResolvedValue({ kind: "guest", guestToken: "guest-quote-owner-b" });
    const selectResult = await selectShippingOptionForActiveCart({ quoteId, optionId });

    expect(selectResult.status).toBe("forbidden");
  });
});
