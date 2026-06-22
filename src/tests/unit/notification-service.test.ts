import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryNotificationRepository, getNotificationFallbackStore } from "@/features/notifications/memory-repository";
import { createMockEmailProvider } from "@/features/notifications/providers";
import { createNotificationService } from "@/features/notifications/service";
import type { OrderPaidContext } from "@/features/notifications/types";

describe("notification service", () => {
  beforeEach(() => {
    getNotificationFallbackStore().clear();
  });

  it("creates customer and admin mocked deliveries only once", async () => {
    const repository = createMemoryNotificationRepository();
    const service = createNotificationService({
      repository,
      provider: createMockEmailProvider(),
      adminRecipients: ["admin@example.com"]
    });
    const context = createContext();

    const first = await service.processOrderPaid(context);
    const second = await service.processOrderPaid(context);

    expect(first).toHaveLength(2);
    expect(first.every((delivery) => delivery.status === "mocked")).toBe(true);
    expect(second).toHaveLength(2);
    expect(await repository.listForAdminOrder(context.order.id)).toHaveLength(2);
  });

  it("records missing admin recipients as skipped", async () => {
    const repository = createMemoryNotificationRepository();
    const deliveries = await createNotificationService({
      repository,
      provider: createMockEmailProvider(),
      adminRecipients: []
    }).processOrderPaid(createContext());

    expect(deliveries).toHaveLength(2);
    expect(deliveries).toContainEqual(
      expect.objectContaining({
        type: "admin_order_paid",
        status: "skipped",
        lastError: "Destinatários internos não configurados."
      })
    );
  });

  it("records a safe provider failure without mutating the paid order", async () => {
    const context = createContext();
    const originalOrder = structuredClone(context.order);
    const deliveries = await createNotificationService({
      repository: createMemoryNotificationRepository(),
      provider: createMockEmailProvider({ fail: true }),
      adminRecipients: ["admin@example.com"]
    }).processOrderPaid(context);

    expect(deliveries.every((delivery) => delivery.status === "failed")).toBe(true);
    expect(context.order).toEqual(originalOrder);
    expect(context.order.status).toBe("pago");
  });
});

function createContext(): OrderPaidContext {
  const now = new Date("2026-06-11T12:00:00.000Z");
  return {
    event: {
      eventType: "order_paid",
      orderId: "order-notification",
      userId: "user-notification",
      paymentIntentId: "payment-notification",
      paymentEventId: "event-notification",
      occurredAt: now
    },
    order: {
      id: "order-notification",
      userId: "user-notification",
      cartId: "cart-notification",
      number: "TE-NOTIFICATION",
      status: "pago",
      subtotalCents: 24990,
      discountTotalCents: 0,
      shippingTotalCents: 1000,
      grandTotalCents: 25990,
      currency: "BRL",
      customerSnapshot: {
        fullName: "Cliente Teste",
        email: "customer@example.com",
        phone: "11999999999"
      },
      shippingAddressSnapshot: {
        recipient: "Cliente Teste",
        postalCode: "01001000",
        state: "SP",
        city: "Sao Paulo",
        district: "Centro",
        street: "Rua Segura",
        number: "10",
        complement: null,
        country: "BR"
      },
      shippingSnapshot: {
        postalCode: "01001000",
        quoteId: "quote",
        optionId: "option",
        provider: "manual",
        source: "manual",
        label: "Entrega padrao",
        estimatedDays: 3,
        originalAmountCents: 1000,
        effectiveAmountCents: 1000,
        freeShippingApplied: false
      },
      couponSnapshot: null,
      items: [
        {
          id: "item",
          orderId: "order-notification",
          productId: "product",
          skuSnapshot: "SKU",
          nameSnapshot: "Oud Essenza",
          slugSnapshot: "oud-essenza",
          imageSnapshot: null,
          unitPriceCents: 24990,
          quantity: 1,
          lineTotalCents: 24990
        }
      ],
      publicToken: "public-token",
      createdAt: now,
      expiresAt: new Date("2026-06-11T13:00:00.000Z"),
      paidAt: now,
      persistence: "dev_fallback"
    }
  };
}
