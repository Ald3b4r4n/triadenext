import type { NotificationDeliveryStatus } from "./types";

const transitions: Record<NotificationDeliveryStatus, NotificationDeliveryStatus[]> = {
  pending: ["sending", "skipped"],
  sending: ["sent", "mocked", "failed"],
  sent: [],
  mocked: [],
  failed: [],
  skipped: []
};

export function canTransitionNotificationStatus(
  from: NotificationDeliveryStatus,
  to: NotificationDeliveryStatus
) {
  return transitions[from].includes(to);
}

export function assertNotificationStatusTransition(
  from: NotificationDeliveryStatus,
  to: NotificationDeliveryStatus
) {
  if (!canTransitionNotificationStatus(from, to)) {
    throw new Error(`Transição de notificação inválida: ${from} -> ${to}.`);
  }
}
