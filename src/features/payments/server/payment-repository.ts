import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { paymentEvents, paymentIntents } from "@/db/schema";
import { centsToDecimal } from "@/features/orders/domain";
import type {
  InternalPaymentStatus,
  PaymentEventRecord,
  PaymentIntentRecord,
  PaymentProvider
} from "../types";

export type PaymentRepository = {
  createPending(input: {
    orderId: string;
    provider: PaymentProvider;
    amountCents: number;
    currency: "BRL";
  }): Promise<PaymentIntentRecord>;
  findLatestForOrder(orderId: string): Promise<PaymentIntentRecord | null>;
  findByProviderReference(providerReference: string): Promise<PaymentIntentRecord | null>;
  setProviderIntent(input: {
    id: string;
    providerReference: string;
    clientSecret: string;
    status: InternalPaymentStatus;
  }): Promise<PaymentIntentRecord>;
  updateStatus(input: {
    id: string;
    status: InternalPaymentStatus;
    failureReason?: string | null;
    paidAt?: Date | null;
  }): Promise<PaymentIntentRecord | null>;
  createEventIfNew(input: {
    eventId: string;
    eventType: string;
    signatureValid: boolean;
    paymentIntentId?: string | null;
    orderId?: string | null;
    payload?: unknown;
  }): Promise<{ created: boolean; event: PaymentEventRecord }>;
  finishEvent(input: {
    eventId: string;
    processingStatus: PaymentEventRecord["processingStatus"];
    failureReason?: string | null;
  }): Promise<void>;
};

export function createPaymentRepository(): PaymentRepository {
  return db === null ? createFallbackPaymentRepository() : createDrizzlePaymentRepository();
}

function createFallbackPaymentRepository(): PaymentRepository {
  const store = getFallbackPaymentStore();
  const events = getFallbackPaymentEventStore();

  return {
    async createPending(input) {
      const now = new Date();
      const record: PaymentIntentRecord = {
        id: `pay_mock_${input.orderId}_${Date.now()}`,
        orderId: input.orderId,
        provider: input.provider,
        providerReference: null,
        status: "pendente",
        amountCents: input.amountCents,
        currency: input.currency,
        failureReason: null,
        paidAt: null,
        createdAt: now,
        updatedAt: now
      };
      store.set(record.id, record);
      return record;
    },
    async findLatestForOrder(orderId) {
      return (
        [...store.values()]
          .filter((record) => record.orderId === orderId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
      );
    },
    async findByProviderReference(providerReference) {
      return (
        [...store.values()].find(
          (record) => record.providerReference === providerReference
        ) ?? null
      );
    },
    async setProviderIntent(input) {
      const current = store.get(input.id);
      if (!current) {
        throw new Error("Pagamento interno nao encontrado.");
      }
      const updated = {
        ...current,
        providerReference: input.providerReference,
        clientSecret: input.clientSecret,
        status: input.status,
        updatedAt: new Date()
      };
      store.set(updated.id, updated);
      return updated;
    },
    async updateStatus(input) {
      const current = store.get(input.id);
      if (!current) {
        return null;
      }
      const updated = {
        ...current,
        status: input.status,
        failureReason: input.failureReason ?? null,
        paidAt: input.paidAt ?? current.paidAt,
        updatedAt: new Date()
      };
      store.set(updated.id, updated);
      return updated;
    },
    async createEventIfNew(input) {
      const existing = events.get(input.eventId);
      if (existing) {
        return { created: false, event: existing };
      }
      const event: PaymentEventRecord = {
        id: `event_${input.eventId}`,
        eventId: input.eventId,
        eventType: input.eventType,
        signatureValid: input.signatureValid,
        paymentIntentId: input.paymentIntentId ?? null,
        orderId: input.orderId ?? null,
        processingStatus: "received",
        failureReason: null,
        processedAt: null,
        createdAt: new Date()
      };
      events.set(event.eventId, event);
      return { created: true, event };
    },
    async finishEvent(input) {
      const current = events.get(input.eventId);
      if (!current) {
        return;
      }
      events.set(input.eventId, {
        ...current,
        processingStatus: input.processingStatus,
        failureReason: input.failureReason ?? null,
        processedAt: new Date()
      });
    }
  };
}

function createDrizzlePaymentRepository(): PaymentRepository {
  if (db === null) {
    return createFallbackPaymentRepository();
  }
  const database = db;

  return {
    async createPending(input) {
      const [created] = await database
        .insert(paymentIntents)
        .values({
          orderId: input.orderId,
          provider: input.provider,
          status: "pendente",
          amount: centsToDecimal(input.amountCents),
          currency: input.currency
        })
        .returning();
      return toPaymentIntent(created);
    },
    async findLatestForOrder(orderId) {
      const [row] = await database
        .select()
        .from(paymentIntents)
        .where(eq(paymentIntents.orderId, orderId))
        .orderBy(desc(paymentIntents.createdAt))
        .limit(1);
      return row ? toPaymentIntent(row) : null;
    },
    async findByProviderReference(providerReference) {
      const [row] = await database
        .select()
        .from(paymentIntents)
        .where(eq(paymentIntents.providerReference, providerReference))
        .limit(1);
      return row ? toPaymentIntent(row) : null;
    },
    async setProviderIntent(input) {
      const [updated] = await database
        .update(paymentIntents)
        .set({
          providerReference: input.providerReference,
          status: toPersistedPaymentStatus(input.status),
          updatedAt: new Date()
        })
        .where(eq(paymentIntents.id, input.id))
        .returning();
      return { ...toPaymentIntent(updated), clientSecret: input.clientSecret };
    },
    async updateStatus(input) {
      const [updated] = await database
        .update(paymentIntents)
        .set({
          status: toPersistedPaymentStatus(input.status),
          failureReason: input.failureReason ?? null,
          paidAt: input.paidAt,
          updatedAt: new Date()
        })
        .where(eq(paymentIntents.id, input.id))
        .returning();
      return updated ? toPaymentIntent(updated) : null;
    },
    async createEventIfNew(input) {
      const [existing] = await database
        .select()
        .from(paymentEvents)
        .where(eq(paymentEvents.eventId, input.eventId))
        .limit(1);
      if (existing) {
        return { created: false, event: toPaymentEvent(existing) };
      }

      const [created] = await database
        .insert(paymentEvents)
        .values({
          eventId: input.eventId,
          eventType: input.eventType,
          signatureValid: input.signatureValid,
          paymentIntentId: input.paymentIntentId,
          orderId: input.orderId,
          payload: sanitizeEventPayload(input.payload)
        })
        .onConflictDoNothing({ target: paymentEvents.eventId })
        .returning();
      if (!created) {
        const [concurrent] = await database
          .select()
          .from(paymentEvents)
          .where(eq(paymentEvents.eventId, input.eventId))
          .limit(1);
        if (!concurrent) {
          throw new Error("Evento de pagamento concorrente nao foi resolvido.");
        }
        return { created: false, event: toPaymentEvent(concurrent) };
      }
      return { created: true, event: toPaymentEvent(created) };
    },
    async finishEvent(input) {
      await database
        .update(paymentEvents)
        .set({
          processingStatus: input.processingStatus,
          failureReason: input.failureReason ?? null,
          processedAt: new Date()
        })
        .where(eq(paymentEvents.eventId, input.eventId));
    }
  };
}

function toPaymentIntent(row: typeof paymentIntents.$inferSelect): PaymentIntentRecord {
  return {
    id: row.id,
    orderId: row.orderId,
    provider: row.provider === "stripe_mock" ? "stripe_mock" : "stripe",
    providerReference: row.providerReference,
    status: row.status,
    amountCents: Math.round(Number(row.amount) * 100),
    currency: "BRL",
    failureReason: row.failureReason,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function toPaymentEvent(row: typeof paymentEvents.$inferSelect): PaymentEventRecord {
  return {
    id: row.id,
    paymentIntentId: row.paymentIntentId,
    orderId: row.orderId,
    eventId: row.eventId,
    eventType: row.eventType,
    signatureValid: row.signatureValid,
    processingStatus: normalizeProcessingStatus(row.processingStatus),
    failureReason: row.failureReason,
    processedAt: row.processedAt,
    createdAt: row.createdAt
  };
}

function normalizeProcessingStatus(value: string): PaymentEventRecord["processingStatus"] {
  if (
    value === "processed" ||
    value === "duplicate" ||
    value === "failed" ||
    value === "ignored"
  ) {
    return value;
  }
  return "received";
}

function toPersistedPaymentStatus(status: InternalPaymentStatus) {
  if (
    status === "pago" ||
    status === "falhou" ||
    status === "cancelado" ||
    status === "reembolsado"
  ) {
    return status;
  }
  return "pendente" as const;
}

function sanitizeEventPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const value = payload as Record<string, unknown>;
  return {
    id: value.id,
    type: value.type
  };
}

function getFallbackPaymentStore() {
  const globalStore = globalThis as typeof globalThis & {
    __triadePaymentFallbackStore?: Map<string, PaymentIntentRecord>;
  };
  globalStore.__triadePaymentFallbackStore ??= new Map();
  return globalStore.__triadePaymentFallbackStore;
}

function getFallbackPaymentEventStore() {
  const globalStore = globalThis as typeof globalThis & {
    __triadePaymentEventFallbackStore?: Map<string, PaymentEventRecord>;
  };
  globalStore.__triadePaymentEventFallbackStore ??= new Map();
  return globalStore.__triadePaymentEventFallbackStore;
}
