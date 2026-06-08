import { describe, expect, it, vi } from "vitest";

const { addItemToCartMock } = vi.hoisted(() => ({
  addItemToCartMock: vi.fn()
}));

vi.mock("@/features/cart/server/cart-service", () => ({
  addItemToCart: addItemToCartMock,
  clearActiveCart: vi.fn(),
  getActiveCart: vi.fn(),
  removeCartItem: vi.fn(),
  updateCartItemQuantity: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

import { addCartItemAction } from "@/features/cart/server/cart-actions";

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
});
