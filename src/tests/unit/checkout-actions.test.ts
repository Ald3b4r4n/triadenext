import { describe, expect, it, vi } from "vitest";

const { createPendingCheckoutOrderMock } = vi.hoisted(() => ({
  createPendingCheckoutOrderMock: vi.fn()
}));

vi.mock("@/features/checkout/server/checkout-service", () => ({
  reviewPendingCheckout: vi.fn(),
  createPendingCheckoutOrder: createPendingCheckoutOrderMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

import { createPendingOrderAction } from "@/features/checkout/server/checkout-actions";

describe("checkout actions", () => {
  it("validates required address and customer fields", async () => {
    const result = await createPendingOrderAction({ status: "idle", message: "" }, new FormData());

    expect(result.status).toBe("error");
    expect(createPendingCheckoutOrderMock).not.toHaveBeenCalled();
  });

  it("does not pass financial, owner or role fields to the checkout service", async () => {
    const formData = validFormData();
    formData.set("subtotalCents", "1");
    formData.set("discountCents", "999999");
    formData.set("shippingAmountCents", "1");
    formData.set("grandTotalCents", "1");
    formData.set("userId", "attacker");
    formData.set("cartId", "attacker-cart");
    formData.set("role", "admin");
    createPendingCheckoutOrderMock.mockResolvedValueOnce({
      status: "success",
      order: { id: "order-1" },
      message: "ok"
    });

    await createPendingOrderAction({ status: "idle", message: "" }, formData);

    expect(createPendingCheckoutOrderMock).toHaveBeenCalledWith({
      fullName: "Cliente Teste",
      phone: "11999999999",
      postalCode: "01001-000",
      state: "SP",
      city: "Sao Paulo",
      district: "Centro",
      street: "Rua Teste",
      number: "123",
      complement: "",
      recipient: ""
    });
  });
});

function validFormData() {
  const formData = new FormData();
  formData.set("fullName", "Cliente Teste");
  formData.set("phone", "11999999999");
  formData.set("postalCode", "01001-000");
  formData.set("state", "SP");
  formData.set("city", "Sao Paulo");
  formData.set("district", "Centro");
  formData.set("street", "Rua Teste");
  formData.set("number", "123");
  formData.set("complement", "");
  formData.set("recipient", "");
  return formData;
}
