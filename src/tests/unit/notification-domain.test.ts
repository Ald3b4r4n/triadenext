import { describe, expect, it } from "vitest";
import { sanitizeNotificationError } from "@/features/notifications/errors";
import { buildNotificationIdempotencyKey } from "@/features/notifications/idempotency";
import {
  canTransitionNotificationStatus
} from "@/features/notifications/status";
import { renderAdminOrderPaidEmail } from "@/features/notifications/templates/admin-order-paid";
import { renderCustomerOrderPaidEmail } from "@/features/notifications/templates/customer-order-paid";

const templateInput = {
  orderNumber: "TE-100",
  orderId: "order-100",
  status: "pago" as const,
  totalCents: 25990,
  currency: "BRL" as const,
  items: [{ name: "Oud Essenza", quantity: 1, lineTotalCents: 24990 }],
  shipping: {
    label: "Entrega padrao",
    provider: "manual",
    estimatedDays: 3,
    amountCents: 1000
  },
  addressSummary: "Rua Segura, 10, Sao Paulo, SP, 01001000"
};

describe("notification domain", () => {
  it("builds a deterministic key and normalizes recipients", () => {
    const first = buildNotificationIdempotencyKey({
      orderId: "order-1",
      eventType: "order_paid",
      notificationType: "customer_order_paid",
      recipient: " Customer@Example.com "
    });
    const second = buildNotificationIdempotencyKey({
      orderId: "order-1",
      eventType: "order_paid",
      notificationType: "customer_order_paid",
      recipient: "customer@example.com"
    });

    expect(first).toBe(second);
    expect(first).toContain("customer@example.com");
  });

  it("allows only the standardized outbox transitions", () => {
    expect(canTransitionNotificationStatus("pending", "sending")).toBe(true);
    expect(canTransitionNotificationStatus("sending", "mocked")).toBe(true);
    expect(canTransitionNotificationStatus("mocked", "sending")).toBe(false);
  });

  it("sanitizes provider errors", () => {
    expect(
      sanitizeNotificationError(
        new Error(
          "api_key=abc123 password=secret token=unsafe whsec_value client_secret=pi_secret DATABASE_URL=postgres://secret"
        )
      )
    ).not.toMatch(/abc123|password=secret|token=unsafe|whsec_value|pi_secret|postgres:\/\/secret/i);
  });

  it("renders the customer and admin templates from safe snapshots", () => {
    const customer = renderCustomerOrderPaidEmail(templateInput);
    const admin = renderAdminOrderPaidEmail({
      ...templateInput,
      customerName: "Cliente Teste",
      customerEmail: "cliente@example.com"
    });
    const combined = JSON.stringify({ customer, admin }).toLowerCase();

    expect(customer.subject).toContain("TE-100");
    expect(customer.text).toContain("Oud Essenza");
    expect(admin.text).toContain("Cliente Teste");
    expect(combined).not.toMatch(
      /card_number|client_secret|webhook_secret|database_url|smtp_password/
    );
  });
});
