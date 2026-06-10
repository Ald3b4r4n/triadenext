import type { CouponType } from "@/features/coupons/types";
import type { ShippingOption } from "@/features/shipping/types";

export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "em_preparacao"
  | "enviado"
  | "entregue"
  | "cancelado"
  | "expirado"
  | "reembolsado";

export type OrderPersistence = "real" | "dev_fallback";

export type OrderCustomerSnapshot = {
  fullName: string;
  email: string;
  phone: string;
};

export type OrderAddressSnapshot = {
  recipient: string;
  postalCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement: string | null;
  country: "BR";
};

export type OrderCouponSnapshot = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  discountCents: number;
  usedCountAtCheckout: number;
} | null;

export type OrderShippingSnapshot = {
  postalCode: string;
  quoteId: string;
  optionId: string;
  provider: ShippingOption["provider"];
  source: ShippingOption["source"];
  label: string;
  estimatedDays: number | null;
  originalAmountCents: number;
  effectiveAmountCents: number;
  freeShippingApplied: boolean;
};

export type PendingOrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  skuSnapshot: string;
  nameSnapshot: string;
  slugSnapshot: string | null;
  imageSnapshot: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type PendingOrder = {
  id: string;
  userId: string;
  cartId: string;
  number: string;
  status: OrderStatus;
  subtotalCents: number;
  discountTotalCents: number;
  shippingTotalCents: number;
  grandTotalCents: number;
  currency: "BRL";
  customerSnapshot: OrderCustomerSnapshot;
  shippingAddressSnapshot: OrderAddressSnapshot;
  shippingSnapshot: OrderShippingSnapshot;
  couponSnapshot: OrderCouponSnapshot;
  items: PendingOrderItem[];
  publicToken: string;
  createdAt: Date;
  expiresAt: Date;
  paidAt?: Date | null;
  persistence: OrderPersistence;
};

export type PendingOrderDraft = Omit<PendingOrder, "id" | "number" | "publicToken" | "createdAt" | "persistence" | "items"> & {
  createdAt: Date;
  status: "aguardando_pagamento";
  items: Array<Omit<PendingOrderItem, "id" | "orderId">>;
};

export type OrderReadResult =
  | { status: "success"; orders: PendingOrder[]; message?: string }
  | { status: "unauthenticated"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "unavailable"; message: string };

export type OrderDetailResult =
  | { status: "success"; order: PendingOrder; message?: string }
  | { status: "unauthenticated"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "not_found"; message: string }
  | { status: "unavailable"; message: string };
