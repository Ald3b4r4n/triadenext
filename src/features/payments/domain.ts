import type { PendingOrder } from "@/features/orders/types";
import type { PayableOrder, StripeIntentPayload } from "./types";

export function isPayableOrder(order: PendingOrder, now = new Date()): order is PayableOrder {
  return order.status === "aguardando_pagamento" && order.expiresAt.getTime() > now.getTime();
}

export function validatePayableOrder(order: PendingOrder | null, now = new Date()) {
  if (!order) {
    return { status: "not_found" as const, message: "Pedido nao encontrado." };
  }

  if (order.status !== "aguardando_pagamento") {
    return { status: "validation_error" as const, message: "Pedido nao esta aguardando pagamento." };
  }

  if (order.expiresAt.getTime() <= now.getTime()) {
    return { status: "validation_error" as const, message: "Pedido expirado nao pode iniciar pagamento." };
  }

  if (order.grandTotalCents <= 0) {
    return { status: "validation_error" as const, message: "Pedido com total invalido nao pode ser pago." };
  }

  return { status: "valid" as const, order: order as PayableOrder };
}

export function validateStripeIntentMatchesOrder(input: {
  stripeIntent: StripeIntentPayload;
  order: PendingOrder;
}) {
  const currency = input.stripeIntent.currency.toUpperCase();
  if (input.stripeIntent.amount !== input.order.grandTotalCents) {
    return {
      status: "divergent" as const,
      message: "Valor do PaymentIntent diverge do snapshot do pedido."
    };
  }

  if (currency !== input.order.currency) {
    return {
      status: "divergent" as const,
      message: "Moeda do PaymentIntent diverge do snapshot do pedido."
    };
  }

  if (input.stripeIntent.metadata?.orderId && input.stripeIntent.metadata.orderId !== input.order.id) {
    return {
      status: "divergent" as const,
      message: "Pedido do metadata Stripe diverge do pedido interno."
    };
  }

  return { status: "valid" as const };
}

export function sanitizePaymentFailureReason(value: unknown) {
  const raw = value instanceof Error ? value.message : String(value ?? "Falha de pagamento.");
  return raw
    .replace(/sk_(live|test)_[A-Za-z0-9_]+/g, "[stripe-secret-redacted]")
    .replace(/whsec_[A-Za-z0-9_]+/g, "[webhook-secret-redacted]")
    .slice(0, 500);
}

export function buildStripeIdempotencyKey(orderId: string, paymentIntentId: string) {
  return `triade:f9:order:${orderId}:payment:${paymentIntentId}`;
}
