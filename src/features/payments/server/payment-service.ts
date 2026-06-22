import "server-only";

import { createOrderRepository } from "@/features/orders/server/order-repository";
import { sanitizePaymentFailureReason, validatePayableOrder } from "../domain";
import { createPaymentRepository } from "./payment-repository";
import { getPaymentRuntimeConfig } from "./payment-config";
import { createStripePaymentAdapter, paymentRecordCanBeReused } from "./stripe-adapter";
import type { PaymentStatusResult, StartPaymentResult } from "../types";

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
      existing.providerReference
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
      currency: payableOrder.currency
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
  return {
    status: "success",
    order,
    paymentIntent: await paymentRepository.findLatestForOrder(order.id)
  };
}
