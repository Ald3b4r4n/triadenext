import type { OrderStatus, PendingOrder } from "@/features/orders/types";

export type PaymentProvider = "stripe" | "stripe_mock";
export type InternalPaymentStatus =
  | "pendente"
  | "processando"
  | "requer_acao"
  | "pago"
  | "falhou"
  | "cancelado"
  | "reembolsado"
  | "divergente";

export type PaymentIntentRecord = {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerReference: string | null;
  status: InternalPaymentStatus;
  amountCents: number;
  currency: "BRL";
  failureReason: string | null;
  clientSecret?: string;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PayableOrder = PendingOrder & {
  status: "aguardando_pagamento";
};

export type PaymentEventRecord = {
  id: string;
  paymentIntentId: string | null;
  orderId: string | null;
  eventId: string;
  eventType: string;
  signatureValid: boolean;
  processingStatus: "received" | "processed" | "duplicate" | "failed" | "ignored";
  failureReason: string | null;
  processedAt: Date | null;
  createdAt: Date;
};

export type StartPaymentSuccess = {
  status: "success";
  mode: "real" | "mock";
  paymentIntent: PaymentIntentRecord;
  clientSecret: string;
  publishableKey: string;
  message: string;
};

export type PaymentActionErrorStatus =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "validation_error"
  | "unavailable";

export type StartPaymentResult =
  | StartPaymentSuccess
  | { status: PaymentActionErrorStatus; message: string };

export type PaymentStatusResult =
  | {
      status: "success";
      order: PendingOrder;
      paymentIntent: PaymentIntentRecord | null;
      message?: string;
    }
  | { status: PaymentActionErrorStatus; message: string };

export type StripeIntentPayload = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string | null;
  metadata?: {
    orderId?: string;
    userId?: string;
    internalPaymentIntentId?: string;
  };
};

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: StripeIntentPayload;
  };
};

export type WebhookProcessingResult = {
  status: "processed" | "duplicate" | "ignored" | "failed";
  message: string;
  orderStatus?: OrderStatus;
};
