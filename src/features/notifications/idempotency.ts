import { normalizeEmailRecipient } from "./recipients";
import type { NotificationType } from "./types";

export function buildNotificationIdempotencyKey(input: {
  orderId: string;
  eventType: "order_paid";
  notificationType: NotificationType;
  recipient: string;
}) {
  return [
    "order_paid",
    input.orderId,
    input.eventType,
    input.notificationType,
    normalizeEmailRecipient(input.recipient)
  ].join(":");
}
