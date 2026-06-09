import { describe, expect, it, vi } from "vitest";

const { addItemToCartMock, applyCouponToActiveCartMock } = vi.hoisted(() => ({
  addItemToCartMock: vi.fn(),
  applyCouponToActiveCartMock: vi.fn()
}));

vi.mock("@/features/cart/server/cart-service", () => ({
  addItemToCart: addItemToCartMock,
  applyCouponToActiveCart: applyCouponToActiveCartMock,
  clearActiveCart: vi.fn(),
  getActiveCart: vi.fn(),
  removeCouponFromActiveCart: vi.fn(),
  removeCartItem: vi.fn(),
  updateCartItemQuantity: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

import { addCartItemAction, applyCouponAction } from "@/features/cart/server/cart-actions";

describe("cart actions", () => {
  it("validates inputs before calling the service", async () => {
    const result = await addCartItemAction(new FormData());

    expect(result.status).toBe("validation_error");
    expect(addItemToCartMock).not.toHaveBeenCalled();
  });

  it("does not accept owner fields as trusted action input", async () => {
    const formData = new FormData();
    formData.set("productId", "prod-example-published");
    formData.set("quantity", "1");
    formData.set("userId", "attacker");
    addItemToCartMock.mockResolvedValueOnce({ status: "success", cart: {}, message: "ok" });

    await addCartItemAction(formData);

    expect(addItemToCartMock).toHaveBeenCalledWith({
      productId: "prod-example-published",
      quantity: 1
    });
  });

  it("does not accept discount or owner fields when applying a coupon", async () => {
    const formData = new FormData();
    formData.set("code", "dev10");
    formData.set("discountCents", "999999");
    formData.set("couponId", "attacker-coupon");
    formData.set("cartId", "attacker-cart");
    applyCouponToActiveCartMock.mockResolvedValueOnce({ status: "success", cart: {}, message: "ok" });

    await applyCouponAction(formData);

    expect(applyCouponToActiveCartMock).toHaveBeenCalledWith("dev10");
  });
});
