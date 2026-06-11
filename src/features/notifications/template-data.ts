import type { PendingOrder } from "@/features/orders/types";
import type {
  AdminOrderPaidTemplateInput,
  CustomerOrderPaidTemplateInput
} from "./types";

export function buildCustomerOrderPaidTemplateData(
  order: PendingOrder & { status: "pago" }
): CustomerOrderPaidTemplateInput {
  return {
    orderNumber: order.number,
    orderId: order.id,
    status: "pago",
    totalCents: order.grandTotalCents,
    currency: "BRL",
    items: order.items.map((item) => ({
      name: item.nameSnapshot,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents
    })),
    shipping: order.shippingSnapshot
      ? {
          label: order.shippingSnapshot.label,
          provider: order.shippingSnapshot.provider,
          estimatedDays: order.shippingSnapshot.estimatedDays,
          amountCents: order.shippingSnapshot.effectiveAmountCents
        }
      : null,
    addressSummary: [
      order.shippingAddressSnapshot.street,
      order.shippingAddressSnapshot.number,
      order.shippingAddressSnapshot.district,
      order.shippingAddressSnapshot.city,
      order.shippingAddressSnapshot.state,
      order.shippingAddressSnapshot.postalCode
    ]
      .filter(Boolean)
      .join(", ")
  };
}

export function buildAdminOrderPaidTemplateData(
  order: PendingOrder & { status: "pago" }
): AdminOrderPaidTemplateInput {
  return {
    ...buildCustomerOrderPaidTemplateData(order),
    customerName: order.customerSnapshot.fullName,
    customerEmail: order.customerSnapshot.email
  };
}
