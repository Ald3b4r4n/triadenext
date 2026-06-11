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
  quoteShippingForActiveCart
} from "@/features/cart/server/cart-service";
import { createPendingCheckoutOrder } from "@/features/checkout/server/checkout-service";
import { createCouponRepository } from "@/features/coupons/server/coupon-repository";
import { createOrderRepository } from "@/features/orders/server/order-repository";
import { createNotificationRepository } from "@/features/notifications/drizzle-repository";
import { startOrderPayment } from "@/features/payments/server/payment-service";
import { processStripeWebhook } from "@/features/payments/server/stripe-webhook-service";
import { createProductRepository } from "@/features/products/server/product-repository";

const validForm = {
  fullName: "Cliente Pagamento",
  phone: "11999999999",
  postalCode: "01001-000",
  state: "SP",
  city: "Sao Paulo",
  district: "Centro",
  street: "Rua Pagamento",
  number: "9",
  complement: "",
  recipient: ""
};

describe("payment service", () => {
  beforeEach(() => {
    getCurrentSessionMock.mockReset();
    resolveCartActorMock.mockReset();
  });

  it("creates a mock PaymentIntent using the order snapshot and blocks another owner", async () => {
    const userId = `pay-owner-${Date.now()}`;
    const order = await seedPendingOrder(userId);

    const result = await startOrderPayment({ userId, orderId: order.id });

    expect(result.status).toBe("success");
    expect(result.status === "success" && result.mode).toBe("mock");
    expect(result.status === "success" && result.paymentIntent.amountCents).toBe(
      order.grandTotalCents
    );
    expect(result.status === "success" && result.paymentIntent.currency).toBe("BRL");

    await expect(
      startOrderPayment({ userId: "another-user", orderId: order.id })
    ).resolves.toMatchObject({ status: "not_found" });
  });

  it("requires a valid webhook signature and settles a succeeded event only once", async () => {
    const userId = `pay-webhook-${Date.now()}`;
    const order = await seedPendingOrder(userId, { couponCode: "DEV10" });
    const productRepository = createProductRepository();
    const couponRepository = createCouponRepository();
    const productBefore = await productRepository.findProductById(
      "prod-example-published"
    );
    const couponBefore = await couponRepository.findCouponById("coupon-dev-10");
    const stockBefore = productBefore?.stockQuantity ?? 0;
    const usedCountBefore = couponBefore?.usedCount ?? 0;
    const started = await startOrderPayment({ userId, orderId: order.id });
    expect(started.status).toBe("success");
    if (started.status !== "success" || !started.paymentIntent.providerReference) {
      throw new Error("PaymentIntent mock nao foi criado.");
    }
    expect(
      await productRepository.findProductById("prod-example-published")
    ).toMatchObject({ stockQuantity: stockBefore });
    expect(await couponRepository.findCouponById("coupon-dev-10")).toMatchObject({
      usedCount: usedCountBefore
    });

    const event = {
      id: `evt_${started.paymentIntent.id}`,
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: started.paymentIntent.providerReference,
          amount: order.grandTotalCents,
          currency: "brl",
          status: "succeeded",
          metadata: {
            orderId: order.id,
            userId,
            internalPaymentIntentId: started.paymentIntent.id
          }
        }
      }
    };

    await expect(
      processStripeWebhook({
        rawBody: JSON.stringify(event),
        signature: "invalid"
      })
    ).resolves.toMatchObject({ status: "failed" });

    const processed = await processStripeWebhook({
      rawBody: JSON.stringify(event),
      signature: "triade-mock-signature"
    });
    expect(processed.status).toBe("processed");

    const paidOrder = await createOrderRepository().getCustomerOrder(userId, order.id);
    expect(paidOrder?.status).toBe("pago");
    expect(
      (await productRepository.findProductById("prod-example-published"))
        ?.stockQuantity
    ).toBe(stockBefore - 1);
    expect(
      (await couponRepository.findCouponById("coupon-dev-10"))?.usedCount
    ).toBe(usedCountBefore + 1);
    const notifications = await createNotificationRepository().listForAdminOrder(order.id);
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: "customer_order_paid",
        status: "mocked"
      })
    );
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: "admin_order_paid",
        status: "skipped"
      })
    );

    await expect(
      processStripeWebhook({
        rawBody: JSON.stringify(event),
        signature: "triade-mock-signature"
      })
    ).resolves.toMatchObject({ status: "duplicate" });
    expect(
      (await productRepository.findProductById("prod-example-published"))
        ?.stockQuantity
    ).toBe(stockBefore - 1);
    expect(
      (await couponRepository.findCouponById("coupon-dev-10"))?.usedCount
    ).toBe(usedCountBefore + 1);
    expect(await createNotificationRepository().listForAdminOrder(order.id)).toHaveLength(
      notifications.length
    );
  });

  it("rejects a divergent webhook without marking the order paid", async () => {
    const userId = `pay-divergent-${Date.now()}`;
    const order = await seedPendingOrder(userId);
    const started = await startOrderPayment({ userId, orderId: order.id });
    if (started.status !== "success" || !started.paymentIntent.providerReference) {
      throw new Error("PaymentIntent mock nao foi criado.");
    }

    const result = await processStripeWebhook({
      signature: "triade-mock-signature",
      rawBody: JSON.stringify({
        id: `evt_divergent_${started.paymentIntent.id}`,
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: started.paymentIntent.providerReference,
            amount: 1,
            currency: "brl",
            status: "succeeded",
            metadata: { orderId: order.id }
          }
        }
      })
    });

    expect(result.status).toBe("failed");
    const unchanged = await createOrderRepository().getCustomerOrder(userId, order.id);
    expect(unchanged?.status).toBe("aguardando_pagamento");
  });
});

async function seedPendingOrder(
  userId: string,
  options: { couponCode?: string } = {}
) {
  mockUser(userId);
  await addItemToCart({ productId: "prod-example-published", quantity: 1 });
  if (options.couponCode) {
    const couponResult = await applyCouponToActiveCart(options.couponCode);
    if (couponResult.status !== "success" && couponResult.status !== "fallback") {
      throw new Error(couponResult.message);
    }
  }
  await quoteShippingForActiveCart({ postalCode: "01001-000" });
  const result = await createPendingCheckoutOrder(validForm);
  if (result.status !== "fallback" && result.status !== "success") {
    throw new Error(result.message);
  }
  return result.order;
}

function mockUser(userId: string) {
  getCurrentSessionMock.mockResolvedValue({
    status: "authenticated",
    userId,
    email: `${userId}@example.com`,
    role: "customer"
  });
  resolveCartActorMock.mockResolvedValue({
    kind: "authenticated",
    userId,
    role: "customer"
  });
}
