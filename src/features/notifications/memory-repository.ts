import { assertNotificationStatusTransition } from "./status";
import type { NotificationRepository, NotificationUpdate } from "./repository";
import type { NotificationDelivery } from "./types";

export function createMemoryNotificationRepository(): NotificationRepository {
  const store = getNotificationFallbackStore();

  return {
    async createIfNew(draft) {
      const existing = [...store.values()].find(
        (delivery) => delivery.idempotencyKey === draft.idempotencyKey
      );
      if (existing) {
        return { created: false, delivery: existing };
      }
      const now = new Date();
      const delivery: NotificationDelivery = {
        ...draft,
        id: `notification_${crypto.randomUUID()}`,
        providerMessageId: null,
        status: "pending",
        attemptCount: 0,
        lastError: null,
        sentAt: null,
        failedAt: null,
        createdAt: now,
        updatedAt: now
      };
      store.set(delivery.id, delivery);
      return { created: true, delivery };
    },
    async markSending(id) {
      return update(store, id, { status: "sending", incrementAttempt: true });
    },
    async markDelivered(input) {
      return update(store, input.id, {
        status: input.status,
        provider: input.provider,
        providerMessageId: input.providerMessageId ?? null,
        sentAt: new Date(),
        lastError: null
      });
    },
    async markFailed(input) {
      return update(store, input.id, {
        status: "failed",
        provider: input.provider,
        lastError: input.lastError,
        failedAt: new Date()
      });
    },
    async markSkipped(input) {
      return update(store, input.id, {
        status: "skipped",
        lastError: input.lastError
      });
    },
    async listForAdminOrder(orderId) {
      return [...store.values()]
        .filter((delivery) => delivery.orderId === orderId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  };
}

function update(
  store: Map<string, NotificationDelivery>,
  id: string,
  change: NotificationUpdate
) {
  const current = store.get(id);
  if (!current) {
    throw new Error("Registro de notificacao nao encontrado.");
  }
  assertNotificationStatusTransition(current.status, change.status);
  const updated: NotificationDelivery = {
    ...current,
    ...change,
    attemptCount: current.attemptCount + (change.incrementAttempt ? 1 : 0),
    updatedAt: new Date()
  };
  store.set(id, updated);
  return updated;
}

export function getNotificationFallbackStore() {
  const globalStore = globalThis as typeof globalThis & {
    __triadeNotificationFallbackStore?: Map<string, NotificationDelivery>;
  };
  globalStore.__triadeNotificationFallbackStore ??= new Map();
  return globalStore.__triadeNotificationFallbackStore;
}
