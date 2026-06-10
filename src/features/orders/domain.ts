import type { CartView } from "@/features/cart/types";
import type { Coupon } from "@/features/coupons/types";
import type { Product } from "@/features/products/types";
import type {
  OrderAddressSnapshot,
  OrderCouponSnapshot,
  OrderCustomerSnapshot,
  OrderShippingSnapshot,
  PendingOrderDraft
} from "./types";

export const PENDING_ORDER_STATUS = "aguardando_pagamento" as const;
export const PENDING_ORDER_EXPIRATION_MINUTES = 60;

export function calculatePendingOrderExpiration(createdAt: Date) {
  return new Date(createdAt.getTime() + PENDING_ORDER_EXPIRATION_MINUTES * 60 * 1000);
}

export function centsToDecimal(cents: number) {
  return (cents / 100).toFixed(2);
}

export function createOrderNumber(now = new Date()) {
  const stamp = now.toISOString().replace(/\D/g, "").slice(0, 14);
  return `TE-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function createPublicToken() {
  return `po_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function normalizePostalCode(value: string) {
  return value.replace(/\D/g, "");
}

export function buildCustomerSnapshot(input: {
  fullName: string;
  email: string;
  phone: string;
}): OrderCustomerSnapshot {
  return {
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim()
  };
}

export function buildAddressSnapshot(input: {
  fullName: string;
  recipient?: string | null;
  postalCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement?: string | null;
}): OrderAddressSnapshot {
  return {
    recipient: input.recipient?.trim() || input.fullName.trim(),
    postalCode: normalizePostalCode(input.postalCode),
    state: input.state.trim().toUpperCase(),
    city: input.city.trim(),
    district: input.district.trim(),
    street: input.street.trim(),
    number: input.number.trim(),
    complement: input.complement?.trim() || null,
    country: "BR"
  };
}

export function buildCouponSnapshot(input: {
  coupon: Coupon | null;
  discountCents: number;
}): OrderCouponSnapshot {
  if (!input.coupon) {
    return null;
  }

  return {
    id: input.coupon.id,
    code: input.coupon.code,
    type: input.coupon.type,
    value: input.coupon.value,
    discountCents: input.discountCents,
    usedCountAtCheckout: input.coupon.usedCount
  };
}

export function buildShippingSnapshot(cart: CartView): OrderShippingSnapshot | null {
  if (!cart.shippingQuote || !cart.shippingQuoteId || !cart.shippingQuote.selectedOptionId) {
    return null;
  }

  const selected = cart.shippingQuote.options.find(
    (option) => option.id === cart.shippingQuote?.selectedOptionId
  );

  if (!selected) {
    return null;
  }

  return {
    postalCode: normalizePostalCode(cart.shippingQuote.postalCode),
    quoteId: cart.shippingQuote.id,
    optionId: selected.id,
    provider: selected.provider,
    source: selected.source,
    label: selected.label,
    estimatedDays: selected.estimatedDays,
    originalAmountCents: selected.priceCents,
    effectiveAmountCents: cart.shippingAmountCents,
    freeShippingApplied: selected.priceCents > 0 && cart.shippingAmountCents === 0
  };
}

export function buildPendingOrderDraft(input: {
  userId: string;
  cart: CartView;
  products: Product[];
  customerSnapshot: OrderCustomerSnapshot;
  shippingAddressSnapshot: OrderAddressSnapshot;
  shippingSnapshot: OrderShippingSnapshot;
  couponSnapshot: OrderCouponSnapshot;
  createdAt?: Date;
}): PendingOrderDraft {
  const createdAt = input.createdAt ?? new Date();

  return {
    userId: input.userId,
    cartId: input.cart.id ?? "",
    status: PENDING_ORDER_STATUS,
    subtotalCents: input.cart.subtotalCents,
    discountTotalCents: input.cart.discountCents,
    shippingTotalCents: input.cart.shippingAmountCents,
    grandTotalCents: input.cart.partialTotalWithShippingCents,
    currency: "BRL",
    customerSnapshot: input.customerSnapshot,
    shippingAddressSnapshot: input.shippingAddressSnapshot,
    shippingSnapshot: input.shippingSnapshot,
    couponSnapshot: input.couponSnapshot,
    items: input.cart.items.map((item) => {
      const product = input.products.find((candidate) => candidate.id === item.productId);
      const image = product?.images.find((candidate) => candidate.isCover) ?? product?.images[0] ?? null;

      return {
        productId: item.productId,
        skuSnapshot: product?.sku ?? item.productId,
        nameSnapshot: product?.name ?? item.productNameSnapshot,
        slugSnapshot: product?.slug ?? null,
        imageSnapshot: image?.blobUrl ?? null,
        unitPriceCents: item.unitPriceSnapshotCents,
        quantity: item.quantity,
        lineTotalCents: item.itemSubtotalCents
      };
    }),
    createdAt,
    expiresAt: calculatePendingOrderExpiration(createdAt)
  };
}
