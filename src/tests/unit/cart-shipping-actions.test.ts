import { describe, expect, it, vi } from "vitest";

const { quoteShippingForActiveCartMock, selectShippingOptionForActiveCartMock } = vi.hoisted(() => ({
  quoteShippingForActiveCartMock: vi.fn(),
  selectShippingOptionForActiveCartMock: vi.fn()
}));

vi.mock("@/features/cart/server/cart-service", () => ({
  addItemToCart: vi.fn(),
  applyCouponToActiveCart: vi.fn(),
  clearActiveCart: vi.fn(),
  getActiveCart: vi.fn(),
  quoteShippingForActiveCart: quoteShippingForActiveCartMock,
  removeCouponFromActiveCart: vi.fn(),
  removeCartItem: vi.fn(),
  removeShippingSelectionFromActiveCart: vi.fn(),
  selectShippingOptionForActiveCart: selectShippingOptionForActiveCartMock,
  updateCartItemQuantity: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

import { quoteShippingAction, selectShippingOptionAction } from "@/features/cart/server/cart-actions";

describe("cart shipping actions", () => {
  it("validates CEP and ignores trusted totals from payload", async () => {
    const invalid = new FormData();
    invalid.set("postalCode", "1");

    const result = await quoteShippingAction(invalid);
    expect(result.status).toBe("validation_error");
    expect(quoteShippingForActiveCartMock).not.toHaveBeenCalled();

    const valid = new FormData();
    valid.set("postalCode", "01001-000");
    valid.set("shippingAmountCents", "0");
    quoteShippingForActiveCartMock.mockResolvedValueOnce({ status: "success", cart: {}, message: "ok" });

    await quoteShippingAction(valid);
    expect(quoteShippingForActiveCartMock).toHaveBeenCalledWith({ postalCode: "01001-000" });
  });

  it("rejects malformed quote selection payloads", async () => {
    const result = await selectShippingOptionAction(new FormData());

    expect(result.status).toBe("validation_error");
    expect(selectShippingOptionForActiveCartMock).not.toHaveBeenCalled();
  });
});
