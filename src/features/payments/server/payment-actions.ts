"use server";

import { revalidatePath } from "next/cache";
import { policyMessage, requireCustomer } from "@/features/auth/server/policies";
import { paymentStatusSchema, startPaymentSchema } from "../schemas";
import { getPaymentRuntimeConfig } from "./payment-config";
import { getOrderPaymentStatus, startOrderPayment } from "./payment-service";
import { processStripeWebhook } from "./stripe-webhook-service";
import type { PaymentStatusResult, StartPaymentResult } from "../types";

export async function startOrderPaymentAction(orderId: string): Promise<StartPaymentResult> {
  const policy = await requireCustomer();
  if (policy.status !== "allowed") {
    return {
      status: policy.status === "forbidden" ? "forbidden" : "unauthenticated",
      message: policyMessage(policy)
    };
  }

  const parsed = startPaymentSchema.safeParse({ orderId });
  if (!parsed.success) {
    return {
      status: "validation_error",
      message: parsed.error.issues[0]?.message ?? "Pedido inválido."
    };
  }

  const result = await startOrderPayment({
    userId: policy.userId,
    orderId: parsed.data.orderId
  });
  if (result.status === "success") {
    revalidatePath("/pedidos");
    revalidatePath(`/pedidos/${orderId}/pagamento`);
  }
  return result;
}

export async function getOrderPaymentStatusAction(
  orderId: string
): Promise<PaymentStatusResult> {
  const policy = await requireCustomer();
  if (policy.status !== "allowed") {
    return {
      status: policy.status === "forbidden" ? "forbidden" : "unauthenticated",
      message: policyMessage(policy)
    };
  }

  const parsed = paymentStatusSchema.safeParse({ orderId });
  if (!parsed.success) {
    return {
      status: "validation_error",
      message: parsed.error.issues[0]?.message ?? "Pedido inválido."
    };
  }

  return getOrderPaymentStatus({
    userId: policy.userId,
    orderId: parsed.data.orderId
  });
}

export async function confirmMockPaymentAction(orderId: string) {
  const policy = await requireCustomer();
  if (policy.status !== "allowed") {
    return { status: "unauthenticated" as const, message: policyMessage(policy) };
  }
  if (getPaymentRuntimeConfig().status !== "mock") {
    return {
      status: "unavailable" as const,
      message: "Confirmação de teste só está disponível em dev/test."
    };
  }

  const status = await getOrderPaymentStatus({ userId: policy.userId, orderId });
  if (
    status.status !== "success" ||
    !status.paymentIntent?.providerReference
  ) {
    return {
      status: "validation_error" as const,
      message: "Pagamento de teste não encontrado."
    };
  }

  const event = {
    id: `evt_mock_${status.paymentIntent.id}`,
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: status.paymentIntent.providerReference,
        amount: status.order.grandTotalCents,
        currency: status.order.currency.toLowerCase(),
        status: "succeeded",
        metadata: {
          orderId: status.order.id,
          userId: policy.userId,
          internalPaymentIntentId: status.paymentIntent.id
        }
      }
    }
  };

  const result = await processStripeWebhook({
    rawBody: JSON.stringify(event),
    signature: "triade-mock-signature"
  });
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${orderId}/pagamento`);
  return result;
}
