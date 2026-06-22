import "server-only";

import { createOrderRepository } from "@/features/orders/server/order-repository";
import { createNotificationService } from "./service";

const orderRepository = createOrderRepository();
const notificationService = createNotificationService();

export async function notifyOrderPaidAfterSettlement(input: {
  orderId: string;
  userId: string;
  paymentIntentId: string;
  paymentEventId: string;
  occurredAt: Date;
}) {
  try {
    const order = await orderRepository.getAdminOrder(input.orderId);
    if (!order || order.status !== "pago") {
      return { status: "skipped" as const, message: "Pedido pago não encontrado." };
    }
    const deliveries = await notificationService.processOrderPaid({
      event: {
        eventType: "order_paid",
        orderId: input.orderId,
        userId: input.userId,
        paymentIntentId: input.paymentIntentId,
        paymentEventId: input.paymentEventId,
        occurredAt: input.occurredAt
      },
      order: { ...order, status: "pago" }
    });
    return { status: "processed" as const, deliveries };
  } catch {
    return {
      status: "failed" as const,
      message: "Falha segura ao processar notificacoes pos-pagamento."
    };
  }
}
