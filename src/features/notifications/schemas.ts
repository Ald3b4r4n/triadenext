import { z } from "zod";
import { notificationDeliveryStatuses } from "./types";

export const emailRecipientSchema = z.string().trim().email().max(320);

export const notificationDeliveryDraftSchema = z.object({
  type: z.enum(["customer_order_paid", "admin_order_paid"]),
  channel: z.literal("email"),
  recipient: z.string().trim().min(1).max(320),
  recipientRole: z.enum(["customer", "admin", "manager", "internal"]),
  orderId: z.string().min(1),
  userId: z.string().nullable(),
  paymentEventId: z.string().nullable(),
  eventType: z.literal("order_paid"),
  provider: z.enum(["mock", "resend", "smtp", "unavailable"]),
  idempotencyKey: z.string().min(1).max(500)
});

export const notificationDeliveryStatusSchema = z.enum(notificationDeliveryStatuses);
