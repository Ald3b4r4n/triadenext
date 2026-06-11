import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { notificationDeliveries } from "@/db/schema";
import { createMemoryNotificationRepository } from "./memory-repository";
import type { NotificationRepository } from "./repository";
import type { NotificationDelivery } from "./types";

export function createNotificationRepository(): NotificationRepository {
  if (db === null) {
    return createMemoryNotificationRepository();
  }
  const database = db;

  return {
    async createIfNew(draft) {
      const [created] = await database
        .insert(notificationDeliveries)
        .values(draft)
        .onConflictDoNothing({ target: notificationDeliveries.idempotencyKey })
        .returning();
      if (created) {
        return { created: true, delivery: toDelivery(created) };
      }
      const [existing] = await database
        .select()
        .from(notificationDeliveries)
        .where(eq(notificationDeliveries.idempotencyKey, draft.idempotencyKey))
        .limit(1);
      if (!existing) {
        throw new Error("Registro idempotente de notificacao nao foi resolvido.");
      }
      return { created: false, delivery: toDelivery(existing) };
    },
    async markSending(id) {
      const [updated] = await database
        .update(notificationDeliveries)
        .set({
          status: "sending",
          attemptCount: 1,
          updatedAt: new Date()
        })
        .where(eq(notificationDeliveries.id, id))
        .returning();
      return requireDelivery(updated);
    },
    async markDelivered(input) {
      const [updated] = await database
        .update(notificationDeliveries)
        .set({
          status: input.status,
          provider: input.provider,
          providerMessageId: input.providerMessageId ?? null,
          lastError: null,
          sentAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(notificationDeliveries.id, input.id))
        .returning();
      return requireDelivery(updated);
    },
    async markFailed(input) {
      const now = new Date();
      const [updated] = await database
        .update(notificationDeliveries)
        .set({
          status: "failed",
          provider: input.provider,
          lastError: input.lastError,
          failedAt: now,
          updatedAt: now
        })
        .where(eq(notificationDeliveries.id, input.id))
        .returning();
      return requireDelivery(updated);
    },
    async markSkipped(input) {
      const [updated] = await database
        .update(notificationDeliveries)
        .set({
          status: "skipped",
          lastError: input.lastError,
          updatedAt: new Date()
        })
        .where(eq(notificationDeliveries.id, input.id))
        .returning();
      return requireDelivery(updated);
    },
    async listForAdminOrder(orderId) {
      const rows = await database
        .select()
        .from(notificationDeliveries)
        .where(eq(notificationDeliveries.orderId, orderId))
        .orderBy(desc(notificationDeliveries.createdAt));
      return rows.map(toDelivery);
    }
  };
}

function requireDelivery(row: typeof notificationDeliveries.$inferSelect | undefined) {
  if (!row) {
    throw new Error("Registro de notificacao nao encontrado.");
  }
  return toDelivery(row);
}

function toDelivery(row: typeof notificationDeliveries.$inferSelect): NotificationDelivery {
  return {
    id: row.id,
    type: row.type,
    channel: "email",
    recipient: row.recipient,
    recipientRole: normalizeRole(row.recipientRole),
    orderId: row.orderId,
    userId: row.userId,
    paymentEventId: row.paymentEventId,
    eventType: "order_paid",
    provider: normalizeProvider(row.provider),
    providerMessageId: row.providerMessageId,
    idempotencyKey: row.idempotencyKey,
    status: row.status,
    attemptCount: row.attemptCount,
    lastError: row.lastError,
    sentAt: row.sentAt,
    failedAt: row.failedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function normalizeProvider(value: string): NotificationDelivery["provider"] {
  return value === "mock" || value === "resend" || value === "smtp"
    ? value
    : "unavailable";
}

function normalizeRole(value: string): NotificationDelivery["recipientRole"] {
  if (value === "customer" || value === "admin" || value === "manager") {
    return value;
  }
  return "internal";
}
