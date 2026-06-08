import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveCartActorMock } = vi.hoisted(() => ({
  resolveCartActorMock: vi.fn()
}));

vi.mock("@/features/cart/server/cart-session", () => ({
  resolveCartActor: resolveCartActorMock
}));

import {
  addItemToCart,
  mergeGuestCartIntoUser,
  updateCartItemQuantity
} from "@/features/cart/server/cart-service";

describe("cart service", () => {
  beforeEach(() => {
    resolveCartActorMock.mockReset();
  });

  it("adds a valid product in explicit fallback mode", async () => {
    resolveCartActorMock.mockResolvedValue({ kind: "guest", guestToken: "guest-valid" });

    const result = await addItemToCart({ productId: "prod-example-published", quantity: 1 });

    expect(result.status).toBe("fallback");
    expect(result.status === "fallback" && result.cart.items[0]?.productId).toBe(
      "prod-example-published"
    );
    expect(result.status === "fallback" && result.cart.subtotalCents).toBe(15990);
    expect(result.status === "fallback" && result.cart.persistence).toBe("dev_fallback");
  });

  it("blocks unavailable products", async () => {
    resolveCartActorMock.mockResolvedValue({ kind: "guest", guestToken: "guest-blocked" });

    await expect(addItemToCart({ productId: "prod-example-draft", quantity: 1 })).resolves.toMatchObject({
      status: "product_unavailable"
    });
    await expect(
      addItemToCart({ productId: "prod-example-inactive", quantity: 1 })
    ).resolves.toMatchObject({ status: "product_unavailable" });
    await expect(addItemToCart({ productId: "prod-example-future", quantity: 1 })).resolves.toMatchObject({
      status: "product_unavailable"
    });
    await expect(
      addItemToCart({ productId: "prod-example-out-of-stock", quantity: 1 })
    ).resolves.toMatchObject({ status: "product_unavailable" });
  });

  it("blocks quantity above stock", async () => {
    resolveCartActorMock.mockResolvedValue({ kind: "guest", guestToken: "guest-stock" });

    const result = await addItemToCart({ productId: "prod-example-published", quantity: 99 });

    expect(result).toMatchObject({ status: "insufficient_stock", maxQuantity: 8 });
  });

  it("does not allow updating another actor cart item", async () => {
    resolveCartActorMock.mockResolvedValueOnce({ kind: "guest", guestToken: "guest-owner-a" });
    const addResult = await addItemToCart({ productId: "prod-example-published", quantity: 1 });
    const itemId = addResult.status === "fallback" ? addResult.cart.items[0]?.id : "";

    resolveCartActorMock.mockResolvedValueOnce({ kind: "guest", guestToken: "guest-owner-b" });
    const updateResult = await updateCartItemQuantity({ itemId, quantity: 2 });

    expect(updateResult.status).toBe("forbidden");
  });

  it("merges by summing quantities and remains idempotent after conversion", async () => {
    resolveCartActorMock.mockResolvedValue({ kind: "guest", guestToken: "guest-merge" });
    await addItemToCart({ productId: "prod-example-published", quantity: 2 });

    const firstMerge = await mergeGuestCartIntoUser({
      userId: "user-merge",
      guestToken: "guest-merge"
    });
    const secondMerge = await mergeGuestCartIntoUser({
      userId: "user-merge",
      guestToken: "guest-merge"
    });

    expect(firstMerge.status).toBe("fallback");
    expect(secondMerge.status).toBe("fallback");
    expect(secondMerge.status === "fallback" && secondMerge.cart.items[0]?.quantity).toBe(2);
  });
});
