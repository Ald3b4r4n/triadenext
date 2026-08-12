import "server-only";

import { sanitizePaymentFailureReason } from "../domain";
import { createPaymentRepository } from "./payment-repository";
import { settleSucceededPayment } from "./payment-settlement-service";
import { createStripePaymentAdapter } from "./stripe-adapter";
import type { WebhookProcessingResult } from "../types";

const paymentRepository = createPaymentRepository();

export async function processStripeWebhook(input: {
  rawBody: string;
  signature: string | null;
}): Promise<WebhookProcessingResult> {
  const adapter = createStripePaymentAdapter();
  if (!adapter) {
    return { status: "failed", message: "Pagamento indisponível neste ambiente." };
  }

  let event;
  try {
    event = adapter.constructWebhookEvent(input.rawBody, input.signature);
  } catch (error) {
    return { status: "failed", message: sanitizePaymentFailureReason(error) };
  }

  const stripeIntent = event.data.object;
  const internal =
    await paymentRepository.findByProviderReference(stripeIntent.id) ??
    (stripeIntent.metadata?.internalPaymentIntentId
      ? await paymentRepository.findById(stripeIntent.metadata.internalPaymentIntentId)
      : null);
  const recorded = await paymentRepository.createEventIfNew({
    eventId: event.id,
    eventType: event.type,
    signatureValid: true,
    paymentIntentId: internal?.id,
    orderId: internal?.orderId,
    payload: { id: event.id, type: event.type }
  });

  if (!recorded.created) {
    return { status: "duplicate", message: "Confirmação duplicada ignorada." };
  }

  if (!internal) {
    await paymentRepository.finishEvent({
      eventId: event.id,
      processingStatus: "failed",
      failureReason: "Pagamento interno não encontrado."
    });
    return { status: "failed", message: "Pagamento interno não encontrado." };
  }

  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    return settleSucceededPayment({
      eventId: event.id,
      paymentIntent: internal,
      stripeIntent
    });
  }

  if (
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled" ||
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    await paymentRepository.updateStatus({
      id: internal.id,
      status: event.type === "payment_intent.canceled" || event.type === "checkout.session.expired" ? "cancelado" : "falhou",
      failureReason: `Provedor informou ${event.type}.`
    });
    await paymentRepository.finishEvent({
      eventId: event.id,
      processingStatus: "processed"
    });
    return {
      status: "processed",
      message: "Falha/cancelamento registrado sem marcar pedido como pago."
    };
  }

  await paymentRepository.finishEvent({
    eventId: event.id,
    processingStatus: "ignored"
  });
  return { status: "ignored", message: "Evento de pagamento fora do escopo desta confirmação." };
}
