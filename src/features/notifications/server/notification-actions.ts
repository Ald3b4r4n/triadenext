"use server";

import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";
import { createNotificationRepository } from "../drizzle-repository";
import type { NotificationDelivery } from "../types";

const notificationRepository = createNotificationRepository();
const maxAdminOrderIdsPerRequest = 50;
const safeOrderIdPattern = /^[A-Za-z0-9-]{1,128}$/;

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

  const uniqueOrderIds = [...new Set(orderIds.map((orderId) => orderId.trim()))];
  if (
    uniqueOrderIds.length > maxAdminOrderIdsPerRequest ||
    uniqueOrderIds.some((orderId) => !safeOrderIdPattern.test(orderId))
  ) {
    return {
      status: "unavailable",
      message: "A consulta excede o limite seguro de pedidos. Refine a seleção e tente novamente."
    };
  }

  const deliveriesByOrder: Record<string, NotificationDelivery[]> = {};
  for (const orderId of uniqueOrderIds) {
    deliveriesByOrder[orderId] =
      await notificationRepository.listForAdminOrder(orderId);
  }
  return { status: "success", deliveriesByOrder };
}
