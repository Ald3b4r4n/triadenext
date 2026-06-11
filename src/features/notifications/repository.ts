import type {
  NotificationDelivery,
  NotificationDeliveryDraft,
  NotificationDeliveryStatus,
  NotificationProvider
} from "./types";

export type NotificationRepository = {
  createIfNew(
    draft: NotificationDeliveryDraft
  ): Promise<{ created: boolean; delivery: NotificationDelivery }>;
  markSending(id: string): Promise<NotificationDelivery>;
  markDelivered(input: {
    id: string;
    status: "sent" | "mocked";
    provider: NotificationProvider;
    providerMessageId?: string | null;
  }): Promise<NotificationDelivery>;
  markFailed(input: {
    id: string;
    provider: NotificationProvider;
    lastError: string;
  }): Promise<NotificationDelivery>;
  markSkipped(input: { id: string; lastError: string }): Promise<NotificationDelivery>;
  listForAdminOrder(orderId: string): Promise<NotificationDelivery[]>;
};

export type NotificationUpdate = {
  status: NotificationDeliveryStatus;
  provider?: NotificationProvider;
  providerMessageId?: string | null;
  lastError?: string | null;
  sentAt?: Date | null;
  failedAt?: Date | null;
  incrementAttempt?: boolean;
};
