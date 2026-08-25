import "server-only";

import { createOrderRepository } from "@/features/orders/server/order-repository";
import {
  isStripePaymentSucceeded,
  sanitizePaymentFailureReason,
  validatePayableOrder
} from "../domain";
import { createPaymentRepository } from "./payment-repository";
import { getPaymentRuntimeConfig } from "./payment-config";
import { createStripePaymentAdapter, paymentRecordCanBeReused } from "./stripe-adapter";
import { settleSucceededPayment } from "./payment-settlement-service";
import { env } from "@/lib/env";
import type {
  PaymentIntentRecord,
  PaymentStatusResult,
  StartPaymentResult
} from "../types";

const orderRepository = createOrderRepository();
const paymentRepository = createPaymentRepository();

export async function startOrderPayment(input: {
  userId: string;
  orderId: string;
}): Promise<StartPaymentResult> {
  const order = await orderRepository.getCustomerOrder(input.userId, input.orderId);
  const validation = validatePayableOrder(order);
  if (validation.status !== "valid") {
    return { status: validation.status, message: validation.message };
  }
  const payableOrder = validation.order;

  const config = getPaymentRuntimeConfig();
  const adapter = createStripePaymentAdapter();
  if (!adapter || config.status === "unavailable") {
    return { status: "unavailable", message: config.message };
  }

  try {
    const existing = await paymentRepository.findLatestForOrder(payableOrder.id);
    if (
      existing &&
      paymentRecordCanBeReused(existing) &&
      existing.amountCents === payableOrder.grandTotalCents &&
      existing.currency === payableOrder.currency &&
      existing.providerReference &&
      (adapter.mode === "mock" || existing.providerReference.startsWith("cs_"))
    ) {
      const retrieved = await adapter.retrievePaymentIntent(existing.providerReference);
      return {
        status: "success",
        mode: adapter.mode,
        paymentIntent: { ...existing, clientSecret: retrieved.clientSecret },
        clientSecret: retrieved.clientSecret,
        publishableKey: adapter.publishableKey,
        message: "Pagamento existente reutilizado com segurança."
      };
    }

    const internal = await paymentRepository.createPending({
      orderId: payableOrder.id,
      provider: adapter.mode === "mock" ? "stripe_mock" : "stripe",
      amountCents: payableOrder.grandTotalCents,
      currency: payableOrder.currency
    });
    const created = await adapter.createPaymentIntent({
      orderId: payableOrder.id,
      userId: input.userId,
      internalPaymentIntentId: internal.id,
      amountCents: payableOrder.grandTotalCents,
      currency: payableOrder.currency,
      orderNumber: payableOrder.number,
      customerEmail: payableOrder.customerSnapshot.email,
      returnUrl: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pedidos/${payableOrder.id}/pagamento`
    });
    const paymentIntent = await paymentRepository.setProviderIntent({
      id: internal.id,
      providerReference: created.intent.id,
      clientSecret: created.clientSecret,
      status: created.intent.status === "requires_action" ? "requer_acao" : "pendente"
    });

    return {
      status: "success",
      mode: adapter.mode,
      paymentIntent,
      clientSecret: created.clientSecret,
      publishableKey: adapter.publishableKey,
      message:
        adapter.mode === "mock"
          ? "Pagamento de teste preparado. Nenhuma cobrança real foi feita."
          : "Pagamento preparado. A confirmação final depende do servidor."
    };
  } catch (error) {
    return {
      status: "unavailable",
      message: sanitizePaymentFailureReason(error)
    };
  }
}

export async function getOrderPaymentStatus(input: {
  userId: string;
  orderId: string;
}): Promise<PaymentStatusResult> {
  const order = await orderRepository.getCustomerOrder(input.userId, input.orderId);
  if (!order) {
    return { status: "not_found", message: "Pedido não encontrado." };
  }

  const currentPayment = await paymentRepository.findLatestForOrder(order.id);
  if (
    order.status === "aguardando_pagamento" &&
    currentPayment?.provider === "stripe" &&
    currentPayment.providerReference?.startsWith("cs_")
  ) {
    await reconcileStripeCheckoutSession(currentPayment);
  }

  const refreshedOrder = await orderRepository.getCustomerOrder(input.userId, input.orderId);
  if (!refreshedOrder) {
    return { status: "not_found", message: "Pedido não encontrado." };
  }
  return {
    status: "success",
    order: refreshedOrder,
    paymentIntent: await paymentRepository.findLatestForOrder(refreshedOrder.id)
  };
}

async function reconcileStripeCheckoutSession(
  paymentIntent: PaymentIntentRecord
) {
  const adapter = createStripePaymentAdapter();
  if (!adapter || adapter.mode !== "real" || !paymentIntent.providerReference) {
    return;
  }

  try {
    const stripeIntent = await adapter.retrievePaymentStatus(
      paymentIntent.providerReference
    );
    if (!isStripePaymentSucceeded(stripeIntent)) {
      return;
    }

    const eventId = `reconcile:${paymentIntent.providerReference}`;
    const recorded = await paymentRepository.createEventIfNew({
      eventId,
      eventType: "checkout.session.server_reconciled",
      signatureValid: true,
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.orderId,
      payload: { id: eventId, type: "checkout.session.server_reconciled" }
    });
    if (!recorded.created) {
      return;
    }

    await settleSucceededPayment({ eventId, paymentIntent, stripeIntent });
  } catch {
    // O webhook continua sendo a fonte principal. Uma indisponibilidade temporária
    // da Stripe não deve impedir a leitura do pedido nem expor detalhes internos.
  }
}
