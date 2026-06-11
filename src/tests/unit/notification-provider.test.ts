import { afterEach, describe, expect, it, vi } from "vitest";
import { getNotificationRuntimeConfig } from "@/features/notifications/config";
import { parseAdminNotificationRecipients } from "@/features/notifications/recipients";
import {
  createMockEmailProvider,
  createUnavailableEmailProvider
} from "@/features/notifications/providers";

describe("notification config and providers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes and deduplicates configured admin recipients", () => {
    expect(
      parseAdminNotificationRecipients(
        " Admin@Example.com,admin@example.com;manager@example.com,invalid"
      )
    ).toEqual(["admin@example.com", "manager@example.com"]);
  });

  it("uses explicit mock delivery in test without network or credentials", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ORDER_NOTIFICATION_RECIPIENTS", "");
    expect(getNotificationRuntimeConfig()).toMatchObject({
      provider: "mock",
      adminRecipients: []
    });

    await expect(
      createMockEmailProvider().sendTransactionalEmail({
        to: "customer@example.com",
        subject: "Pedido pago",
        text: "Pedido pago",
        html: "<p>Pedido pago</p>",
        idempotencyKey: "key",
        metadata: {
          orderId: "order",
          eventType: "order_paid",
          notificationType: "customer_order_paid"
        }
      })
    ).resolves.toEqual({ status: "mocked", provider: "mock" });
  });

  it("represents missing production provider as a safe failure", async () => {
    await expect(
      createUnavailableEmailProvider().sendTransactionalEmail({
        to: "customer@example.com",
        subject: "Pedido pago",
        text: "Pedido pago",
        html: "<p>Pedido pago</p>",
        idempotencyKey: "key",
        metadata: {
          orderId: "order",
          eventType: "order_paid",
          notificationType: "customer_order_paid"
        }
      })
    ).resolves.toMatchObject({
      status: "unavailable",
      provider: "unavailable"
    });
  });
});
