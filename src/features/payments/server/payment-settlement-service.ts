import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  coupons,
  orderItems,
  orders,
  paymentEvents,
  paymentIntents,
  products
} from "@/db/schema";
import { createOrderRepository } from "@/features/orders/server/order-repository";
import { createProductRepository } from "@/features/products/server/product-repository";
import { createCouponRepository } from "@/features/coupons/server/coupon-repository";
import { notifyOrderPaidAfterSettlement } from "@/features/notifications/post-payment-event";
import { sanitizePaymentFailureReason, validateStripeIntentMatchesOrder } from "../domain";
import { createPaymentRepository } from "./payment-repository";
import type {
  PaymentIntentRecord,
  StripeIntentPayload,
  WebhookProcessingResult
} from "../types";

const paymentRepository = createPaymentRepository();
const orderRepository = createOrderRepository();
const productRepository = createProductRepository();
const couponRepository = createCouponRepository();

export async function settleSucceededPayment(input: {
  eventId: string;
  paymentIntent: PaymentIntentRecord;
  stripeIntent: StripeIntentPayload;
}): Promise<WebhookProcessingResult> {
  const order = await orderRepository.getAdminOrder(input.paymentIntent.orderId);
  if (!order) {
    return fail(input.eventId, "Pedido interno não encontrado.");
  }

  const match = validateStripeIntentMatchesOrder({
    stripeIntent: input.stripeIntent,
    order
  });
  if (match.status !== "valid") {
    await paymentRepository.updateStatus({
      id: input.paymentIntent.id,
      status: "divergente",
      failureReason: match.message
    });
    return fail(input.eventId, match.message);
  }

  if (order.status === "pago") {
    await paymentRepository.finishEvent({
      eventId: input.eventId,
      processingStatus: "duplicate"
    });
    return { status: "duplicate", message: "Pedido já estava pago.", orderStatus: "pago" };
  }

  const paidAt = new Date();
  if (db === null) {
    for (const item of order.items) {
      if (!item.productId) {
        return fail(input.eventId, `Produto ausente para ${item.nameSnapshot}.`);
      }
      const product = await productRepository.findProductById(item.productId);
      if (!product || product.stockQuantity < item.quantity) {
        return fail(input.eventId, `Estoque insuficiente para ${item.nameSnapshot}.`);
      }
    }
    if (order.couponSnapshot) {
      const coupon = await couponRepository.findCouponById(order.couponSnapshot.id);
      if (!coupon) {
        return fail(input.eventId, "Cupom do pedido não encontrado para consumo.");
      }
    }
    for (const item of order.items) {
      await productRepository.decrementStock(item.productId ?? "", item.quantity);
    }
    if (order.couponSnapshot) {
      await couponRepository.incrementUsedCount(order.couponSnapshot.id);
    }
    await paymentRepository.updateStatus({
      id: input.paymentIntent.id,
      status: "pago",
      paidAt
    });
    await orderRepository.markOrderPaid(order.id, paidAt);
    await paymentRepository.finishEvent({
      eventId: input.eventId,
      processingStatus: "processed"
    });
    await notifyOrderPaidAfterSettlement({
      orderId: order.id,
      userId: order.userId,
      paymentIntentId: input.paymentIntent.id,
      paymentEventId: input.eventId,
      occurredAt: paidAt
    });
    return {
      status: "processed",
      message:
        "Pagamento de teste confirmado; estoque e cupom representam apenas dados locais.",
      orderStatus: "pago"
    };
  }

  try {
    await db.transaction(async (tx) => {
      const [orderRow] = await tx.select().from(orders).where(eq(orders.id, order.id)).limit(1);
      if (!orderRow) {
        throw new Error("Pedido interno não encontrado.");
      }
      if (orderRow.status === "pago") {
        return;
      }

      const itemRows = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      for (const item of itemRows) {
        if (!item.productId) {
          throw new Error(`Produto ausente para o item ${item.id}.`);
        }
        const [updatedProduct] = await tx
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
            updatedAt: paidAt
          })
          .where(
            and(
              eq(products.id, item.productId),
              gte(products.stockQuantity, item.quantity)
            )
          )
          .returning({ id: products.id });
        if (!updatedProduct) {
          throw new Error(`Estoque insuficiente para ${item.nameSnapshot}.`);
        }
      }

      const couponSnapshot = orderRow.couponSnapshot as { id?: string } | null;
      if (couponSnapshot?.id) {
        const [updatedCoupon] = await tx
          .update(coupons)
          .set({
            usedCount: sql`${coupons.usedCount} + 1`,
            updatedAt: paidAt
          })
          .where(eq(coupons.id, couponSnapshot.id))
          .returning({ id: coupons.id });
        if (!updatedCoupon) {
          throw new Error("Cupom do pedido não foi encontrado para consumo.");
        }
      }

      await tx
        .update(paymentIntents)
        .set({ status: "pago", paidAt, failureReason: null, updatedAt: paidAt })
        .where(eq(paymentIntents.id, input.paymentIntent.id));
      await tx
        .update(orders)
        .set({ status: "pago", paidAt, updatedAt: paidAt })
        .where(eq(orders.id, order.id));
      await tx
        .update(paymentEvents)
        .set({ processingStatus: "processed", processedAt: paidAt, failureReason: null })
        .where(eq(paymentEvents.eventId, input.eventId));
    });

    await notifyOrderPaidAfterSettlement({
      orderId: order.id,
      userId: order.userId,
      paymentIntentId: input.paymentIntent.id,
      paymentEventId: input.eventId,
      occurredAt: paidAt
    });

    return {
      status: "processed",
      message: "Pagamento confirmado com segurança pelo servidor.",
      orderStatus: "pago"
    };
  } catch (error) {
    return fail(input.eventId, sanitizePaymentFailureReason(error));
  }
}

async function fail(eventId: string, message: string): Promise<WebhookProcessingResult> {
  await paymentRepository.finishEvent({
    eventId,
    processingStatus: "failed",
    failureReason: message
  });
  return { status: "failed", message };
}
