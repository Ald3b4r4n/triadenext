import { beforeEach, describe, expect, it, vi } from "vitest";

const { processStripeWebhookMock } = vi.hoisted(() => ({
  processStripeWebhookMock: vi.fn()
}));

vi.mock("@/features/payments/server/stripe-webhook-service", () => ({
  processStripeWebhook: processStripeWebhookMock
}));

import { POST } from "@/app/api/webhooks/stripe/route";

describe("Stripe webhook route", () => {
  beforeEach(() => {
    processStripeWebhookMock.mockReset();
  });

  it("returns 400 for an invalid signature or malformed webhook payload", async () => {
    processStripeWebhookMock.mockResolvedValue({
      status: "failed",
      failureKind: "invalid_request",
      message: "Assinatura inválida."
    });

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "invalid-test-signature" },
        body: "{}"
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns 503 when the payment provider is unavailable", async () => {
    processStripeWebhookMock.mockResolvedValue({
      status: "failed",
      failureKind: "unavailable",
      message: "Pagamento indisponível neste ambiente."
    });

    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}"
      })
    );

    expect(response.status).toBe(503);
  });

  it("rejects oversized webhook bodies before processing", async () => {
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "x".repeat(1024 * 1024 + 1)
      })
    );

    expect(response.status).toBe(413);
    expect(processStripeWebhookMock).not.toHaveBeenCalled();
  });
});
