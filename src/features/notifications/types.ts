import type { PendingOrder } from "@/features/orders/types";

export const notificationDeliveryStatuses = [
  "pending",
  "sending",
  "sent",
  "mocked",
  "failed",
  "skipped"
] as const;

export type NotificationDeliveryStatus = (typeof notificationDeliveryStatuses)[number];
export type NotificationType = "customer_order_paid" | "admin_order_paid";
export type NotificationRecipientRole = "customer" | "admin" | "manager" | "internal";
export type NotificationProvider = "mock" | "resend" | "smtp" | "unavailable";

export type NotificationDelivery = {
  id: string;
  type: NotificationType;
  channel: "email";
  recipient: string;
  recipientRole: NotificationRecipientRole;
  orderId: string;
  userId: string | null;
  paymentEventId: string | null;
  eventType: "order_paid";
  provider: NotificationProvider;
  providerMessageId: string | null;
  idempotencyKey: string;
  status: NotificationDeliveryStatus;
  attemptCount: number;
  lastError: string | null;
  sentAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationDeliveryDraft = Omit<
  NotificationDelivery,
  | "id"
  | "providerMessageId"
  | "status"
  | "attemptCount"
  | "lastError"
  | "sentAt"
  | "failedAt"
  | "createdAt"
  | "updatedAt"
>;

export type OrderPaidNotificationEvent = {
  eventType: "order_paid";
  orderId: string;
  userId: string;
  paymentIntentId: string;
  paymentEventId: string;
  occurredAt: Date;
};

export type CustomerOrderPaidTemplateInput = {
  orderNumber: string;
  orderId: string;
  status: "pago";
  totalCents: number;
  currency: "BRL";
  items: Array<{ name: string; quantity: number; lineTotalCents: number }>;
  shipping: {
    label: string;
    provider: string;
    estimatedDays: number | null;
    amountCents: number;
  } | null;
  addressSummary: string;
};

export type AdminOrderPaidTemplateInput = CustomerOrderPaidTemplateInput & {
  customerName: string;
  customerEmail: string;
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

export type TransactionalEmailInput = RenderedEmail & {
  to: string;
  idempotencyKey: string;
  metadata: {
    orderId: string;
    eventType: "order_paid";
    notificationType: NotificationType;
  };
};

export type TransactionalEmailResult =
  | { status: "sent"; provider: NotificationProvider; providerMessageId?: string }
  | { status: "mocked"; provider: "mock" }
  | { status: "failed"; provider: NotificationProvider; safeError: string }
  | { status: "unavailable"; provider: "unavailable"; safeError: string };

export type OrderPaidContext = {
  event: OrderPaidNotificationEvent;
  order: PendingOrder & { status: "pago" };
};
