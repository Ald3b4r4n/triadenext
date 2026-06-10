import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentSessionMock, resolveCartActorMock } = vi.hoisted(() => ({
  getCurrentSessionMock: vi.fn(),
  resolveCartActorMock: vi.fn()
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: getCurrentSessionMock
}));

vi.mock("@/features/cart/server/cart-session", () => ({
  resolveCartActor: resolveCartActorMock
}));

import {
  addItemToCart,
  applyCouponToActiveCart,
  quoteShippingForActiveCart,
  updateCartItemQuantity
} from "@/features/cart/server/cart-service";
import { createCartRepository } from "@/features/cart/server/cart-repository";
import { createPendingCheckoutOrder, reviewPendingCheckout } from "@/features/checkout/server/checkout-service";
import { findCouponById } from "@/features/coupons/server/coupon-service";

const validForm = {
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
};

describe("checkout service", () => {
  beforeEach(() => {
    getCurrentSessionMock.mockReset();
    resolveCartActorMock.mockReset();
  });

  it("blocks checkout without an authenticated session", async () => {
    getCurrentSessionMock.mockResolvedValue({ status: "unauthenticated", reason: "missing" });

    await expect(reviewPendingCheckout()).resolves.toMatchObject({ status: "unauthenticated" });
  });

  it("blocks an empty cart", async () => {
    mockUser("checkout-empty");

    await expect(reviewPendingCheckout()).resolves.toMatchObject({
      status: "validation_error",
      message: expect.stringContaining("Carrinho vazio")
    });
  });

  it("creates a pending order with server-side snapshots and 60 minute expiration", async () => {
    mockUser("checkout-snapshot");
    await seedValidCart();

    const result = await createPendingCheckoutOrder(validForm);

    expect(result.status).toBe("fallback");
    expect(result.status === "fallback" && result.order.status).toBe("aguardando_pagamento");
    expect(result.status === "fallback" && result.order.items[0]?.nameSnapshot).toBe(
      "Produto publicado de exemplo"
    );
    expect(result.status === "fallback" && result.order.customerSnapshot.email).toBe(
      "checkout-snapshot@example.com"
    );
    expect(result.status === "fallback" && result.order.shippingAddressSnapshot.postalCode).toBe("01001000");
    expect(result.status === "fallback" && result.order.expiresAt.getTime() - result.order.createdAt.getTime()).toBe(
      60 * 60 * 1000
    );
  });

  it("ignores financial and ownership values that are not part of the checkout form", async () => {
    mockUser("checkout-payload");
    await seedValidCart();

    const result = await createPendingCheckoutOrder({
      ...validForm,
      subtotalCents: 1,
      discountCents: 999999,
      shippingAmountCents: 1,
      grandTotalCents: 1,
      userId: "attacker",
      cartId: "attacker-cart",
      role: "admin"
    } as typeof validForm);

    expect(result.status).toBe("fallback");
    expect(result.status === "fallback" && result.order.subtotalCents).toBe(15990);
    expect(result.status === "fallback" && result.order.userId).toBe("checkout-payload");
  });

  it("does not consume coupon usedCount and blocks exhausted coupons", async () => {
    mockUser("checkout-coupon");
    await seedValidCart();
    await applyCouponToActiveCart("DEV10");
    const before = await findCouponById("coupon-dev-10");
    const result = await createPendingCheckoutOrder(validForm);
    const after = await findCouponById("coupon-dev-10");

    expect(result.status).toBe("fallback");
    expect(before?.usedCount).toBe(0);
    expect(after?.usedCount).toBe(0);

    mockUser("checkout-exhausted");
    await seedValidCart();
    await createCartRepository().setAppliedCoupon(
      { kind: "authenticated", userId: "checkout-exhausted", role: "customer" },
      "coupon-dev-exhausted"
    );

    await expect(createPendingCheckoutOrder(validForm)).resolves.toMatchObject({
      status: "validation_error"
    });
  });

  it("does not decrement or reserve stock when creating a pending order", async () => {
    mockUser("checkout-stock-effects");
    await seedValidCart();

    const result = await createPendingCheckoutOrder(validForm);

    expect(result.status).toBe("fallback");
    expect(result.status === "fallback" && result.order.items[0]?.quantity).toBe(1);

    mockUser("checkout-stock-blocked");
    await addItemToCart({ productId: "prod-example-published", quantity: 1 });
    const cartAfterBlock = await updateCartItemQuantity({
      itemId: "dev-item-prod-example-published",
      quantity: 99
    });
    expect(cartAfterBlock.status).toBe("insufficient_stock");
  });
});

function mockUser(userId: string) {
  getCurrentSessionMock.mockResolvedValue({
    status: "authenticated",
    userId,
    email: `${userId}@example.com`,
    role: "customer"
  });
  resolveCartActorMock.mockResolvedValue({ kind: "authenticated", userId, role: "customer" });
}

async function seedValidCart() {
  await addItemToCart({ productId: "prod-example-published", quantity: 1 });
  await quoteShippingForActiveCart({ postalCode: "01001-000" });
}
