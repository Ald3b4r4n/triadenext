"use server";

import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";
import { createNotificationRepository } from "../drizzle-repository";
import type { NotificationDelivery } from "../types";

const notificationRepository = createNotificationRepository();

export type AdminNotificationReadResult =
  | { status: "success"; deliveriesByOrder: Record<string, NotificationDelivery[]> }
  | { status: "unauthenticated" | "forbidden" | "unavailable"; message: string };

export async function listAdminNotificationDeliveriesAction(
  orderIds: string[]
): Promise<AdminNotificationReadResult> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") {
    return {
      status:
        policy.status === "unauthenticated"
          ? "unauthenticated"
          : policy.status === "forbidden"
            ? "forbidden"
            : "unavailable",
      message: policyMessage(policy)
    };
  }

  const deliveriesByOrder: Record<string, NotificationDelivery[]> = {};
  for (const orderId of [...new Set(orderIds)]) {
    deliveriesByOrder[orderId] =
      await notificationRepository.listForAdminOrder(orderId);
  }
  return { status: "success", deliveriesByOrder };
}
