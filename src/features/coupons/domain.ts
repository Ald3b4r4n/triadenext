import { clampDiscount } from "@/lib/money";
import type {
  Coupon,
  CouponCalculation,
  CouponStatus,
  CouponType,
  CouponValidationResult,
  CouponView,
  LegacyCouponType
} from "./types";

export function normalizeCouponCode(input: string) {
  return input.trim().toUpperCase();
}

export function mapLegacyCouponType(type: LegacyCouponType): CouponType {
  return type === "percent" ? "percentage" : "fixed_amount";
}

export function normalizeCouponType(type: CouponType | LegacyCouponType): CouponType {
  if (type === "percent" || type === "fixed") {
    return mapLegacyCouponType(type);
  }

  return type;
}

export function getCouponStatus(coupon: Coupon, now = new Date()): CouponStatus {
  if (!coupon.isActive) {
    return "inactive";
  }

  if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) {
    return "scheduled";
  }

  if (coupon.endsAt && coupon.endsAt.getTime() < now.getTime()) {
    return "expired";
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return "exhausted";
  }

  return "active";
}

export function validateCouponForSubtotal(
  coupon: Coupon | null,
  subtotalCents: number,
  now = new Date()
): CouponValidationResult {
  if (!coupon) {
    return {
      status: "invalid",
      code: "coupon_not_found",
      message: "Cupom nao encontrado."
    };
  }

  const status = getCouponStatus(coupon, now);
  if (status !== "active") {
    return {
      status: "invalid",
      code: statusToErrorCode(status),
      message: statusToMessage(status),
      coupon
    };
  }

  if (subtotalCents <= 0) {
    return {
      status: "invalid",
      code: "coupon_minimum_subtotal_not_met",
      message: "Cupom exige carrinho com itens elegiveis.",
      coupon
    };
  }

  if (
    coupon.minimumSubtotalCents !== null &&
    subtotalCents < coupon.minimumSubtotalCents
  ) {
    return {
      status: "invalid",
      code: "coupon_minimum_subtotal_not_met",
      message: "Subtotal insuficiente para este cupom.",
      coupon
    };
  }

  if (!isCouponValueValid(coupon)) {
    return {
      status: "invalid",
      code: "coupon_invalid_value",
      message: "Cupom possui valor invalido.",
      coupon
    };
  }

  if (coupon.type === "free_shipping") {
    return {
      status: "invalid",
      code: "coupon_type_unavailable",
      message:
        "Cupom de frete gratis esta preparado, mas nao aplica frete real nesta fase.",
      coupon
    };
  }

  return { status: "valid", coupon, messages: [] };
}

export function calculateCouponDiscountCents(coupon: Coupon, subtotalCents: number) {
  if (subtotalCents <= 0) {
    return 0;
  }

  if (coupon.type === "percentage") {
    return clampDiscount(subtotalCents, Math.round((subtotalCents * coupon.value) / 100));
  }

  if (coupon.type === "fixed_amount") {
    return clampDiscount(subtotalCents, Math.round(coupon.value));
  }

  return 0;
}

export function calculateCartCoupon(
  coupon: Coupon | null,
  subtotalCents: number,
  now = new Date()
): CouponCalculation {
  const validation = validateCouponForSubtotal(coupon, subtotalCents, now);

  if (validation.status !== "valid") {
    return {
      coupon: validation.coupon ? toCouponView(validation.coupon, now) : null,
      discountCents: 0,
      partialTotalCents: subtotalCents,
      messages: [validation.message]
    };
  }

  const discountCents = calculateCouponDiscountCents(validation.coupon, subtotalCents);
  return {
    coupon: toCouponView(validation.coupon, now),
    discountCents,
    partialTotalCents: subtotalCents - discountCents,
    messages: validation.messages
  };
}

export function toCouponView(coupon: Coupon, now = new Date()): CouponView {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    status: getCouponStatus(coupon, now),
    valueLabel: formatCouponValue(coupon),
    minimumSubtotalCents: coupon.minimumSubtotalCents,
    startsAt: coupon.startsAt,
    endsAt: coupon.endsAt,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    isPreparedBenefit: coupon.type === "free_shipping"
  };
}

export function formatCouponValue(coupon: Pick<Coupon, "type" | "value">) {
  if (coupon.type === "percentage") {
    return `${coupon.value}%`;
  }

  if (coupon.type === "fixed_amount") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(coupon.value / 100);
  }

  return "Frete gratis preparado";
}

function isCouponValueValid(coupon: Coupon) {
  if (coupon.type === "percentage") {
    return coupon.value > 0 && coupon.value <= 100;
  }

  if (coupon.type === "fixed_amount") {
    return Number.isInteger(coupon.value) && coupon.value > 0;
  }

  return coupon.value >= 0;
}

function statusToErrorCode(status: Exclude<CouponStatus, "active">) {
  switch (status) {
    case "inactive":
      return "coupon_inactive" as const;
    case "scheduled":
      return "coupon_scheduled" as const;
    case "expired":
      return "coupon_expired" as const;
    case "exhausted":
      return "coupon_exhausted" as const;
  }
}

function statusToMessage(status: Exclude<CouponStatus, "active">) {
  switch (status) {
    case "inactive":
      return "Cupom inativo.";
    case "scheduled":
      return "Cupom ainda nao esta vigente.";
    case "expired":
      return "Cupom expirado.";
    case "exhausted":
      return "Cupom esgotado.";
  }
}
