import "server-only";

import Stripe from "stripe";
import { buildStripeIdempotencyKey } from "../domain";
import { getPaymentRuntimeConfig } from "./payment-config";
import type { PaymentIntentRecord, StripeIntentPayload, StripeWebhookEvent } from "../types";

export type StripePaymentAdapter = {
  mode: "real" | "mock";
  publishableKey: string;
  createPaymentIntent(input: {
    orderId: string;
    userId: string;
    internalPaymentIntentId: string;
    amountCents: number;
    currency: string;
  }): Promise<{ intent: StripeIntentPayload; clientSecret: string }>;
  retrievePaymentIntent(providerReference: string): Promise<{
    intent: StripeIntentPayload;
    clientSecret: string;
  }>;
  constructWebhookEvent(rawBody: string, signature: string | null): StripeWebhookEvent;
};

export function createStripePaymentAdapter(): StripePaymentAdapter | null {
  const config = getPaymentRuntimeConfig();
  if (config.status === "unavailable") {
    return null;
  }

  if (config.status === "mock") {
    return createMockStripeAdapter(config.publishableKey);
  }

  const stripe = new Stripe(config.secretKey);
  return {
    mode: "real",
    publishableKey: config.publishableKey,
    async createPaymentIntent(input) {
      const intent = await stripe.paymentIntents.create(
        {
          amount: input.amountCents,
          currency: input.currency.toLowerCase(),
          automatic_payment_methods: { enabled: true },
          metadata: {
            orderId: input.orderId,
            userId: input.userId,
            internalPaymentIntentId: input.internalPaymentIntentId
          }
        },
        {
          idempotencyKey: buildStripeIdempotencyKey(
            input.orderId,
            input.internalPaymentIntentId
          )
        }
      );

      if (!intent.client_secret) {
        throw new Error("Provedor não retornou confirmação segura para o pagamento.");
      }

      return {
        intent: toStripeIntentPayload(intent),
        clientSecret: intent.client_secret
      };
    },
    async retrievePaymentIntent(providerReference) {
      const intent = await stripe.paymentIntents.retrieve(providerReference);
      if (!intent.client_secret) {
        throw new Error("Provedor não retornou confirmação segura para o pagamento.");
      }
      return { intent: toStripeIntentPayload(intent), clientSecret: intent.client_secret };
    },
    constructWebhookEvent(rawBody, signature) {
      if (!signature) {
        throw new Error("Assinatura Stripe ausente.");
      }
      return stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.webhookSecret
      ) as unknown as StripeWebhookEvent;
    }
  };
}

function createMockStripeAdapter(publishableKey: string): StripePaymentAdapter {
  return {
    mode: "mock",
    publishableKey,
    async createPaymentIntent(input) {
      const reference = `pi_mock_${input.internalPaymentIntentId.replace(/[^a-zA-Z0-9]/g, "")}`;
      const intent: StripeIntentPayload = {
          id: reference,
          amount: input.amountCents,
          currency: input.currency.toLowerCase(),
          status: "requires_payment_method",
          client_secret: `${reference}_secret_mock`,
          metadata: {
            orderId: input.orderId,
            userId: input.userId,
            internalPaymentIntentId: input.internalPaymentIntentId
          }
      };
      getMockIntentStore().set(reference, intent);
      return { intent, clientSecret: `${reference}_secret_mock` };
    },
    async retrievePaymentIntent(providerReference) {
      const store = getMockIntentStore();
      const intent = store.get(providerReference);
      if (!intent?.client_secret) {
        throw new Error("Pagamento de teste não encontrado.");
      }
      return { intent, clientSecret: intent.client_secret };
    },
    constructWebhookEvent(rawBody, signature) {
      if (signature !== "triade-mock-signature") {
        throw new Error("Assinatura de teste inválida.");
      }
      return JSON.parse(rawBody) as StripeWebhookEvent;
    }
  };
}

function getMockIntentStore() {
  const globalStore = globalThis as typeof globalThis & {
    __triadeStripeMockIntentStore?: Map<string, StripeIntentPayload>;
  };
  globalStore.__triadeStripeMockIntentStore ??= new Map();
  return globalStore.__triadeStripeMockIntentStore;
}

function toStripeIntentPayload(intent: Stripe.PaymentIntent): StripeIntentPayload {
  return {
    id: intent.id,
    amount: intent.amount,
    currency: intent.currency,
    status: intent.status,
    client_secret: intent.client_secret,
    metadata: {
      orderId: intent.metadata.orderId,
      userId: intent.metadata.userId,
      internalPaymentIntentId: intent.metadata.internalPaymentIntentId
    }
  };
}

export function paymentRecordCanBeReused(record: PaymentIntentRecord) {
  return (
    record.status === "pendente" ||
    record.status === "processando" ||
    record.status === "requer_acao"
  );
}
