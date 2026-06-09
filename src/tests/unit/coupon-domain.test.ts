import { describe, expect, it } from "vitest";
import {
  calculateCartCoupon,
  calculateCouponDiscountCents,
  getCouponStatus,
  mapLegacyCouponType,
  normalizeCouponCode,
  validateCouponForSubtotal
} from "@/features/coupons/domain";
import type { Coupon } from "@/features/coupons/types";

const now = new Date("2026-06-08T12:00:00.000Z");

describe("coupon domain", () => {
  it("normalizes coupon codes and maps legacy coupon types explicitly", () => {
    expect(normalizeCouponCode("  dev10 ")).toBe("DEV10");
    expect(mapLegacyCouponType("percent")).toBe("percentage");
    expect(mapLegacyCouponType("fixed")).toBe("fixed_amount");
  });

  it("calculates coupon status", () => {
    expect(getCouponStatus(coupon(), now)).toBe("active");
    expect(getCouponStatus(coupon({ isActive: false }), now)).toBe("inactive");
    expect(getCouponStatus(coupon({ startsAt: new Date("2099-01-01") }), now)).toBe("scheduled");
    expect(getCouponStatus(coupon({ endsAt: new Date("2026-01-01") }), now)).toBe("expired");
    expect(getCouponStatus(coupon({ maxUses: 1, usedCount: 1 }), now)).toBe("exhausted");
  });

  it("validates active, inactive, expired, future, exhausted and minimum subtotal coupons", () => {
    expect(validateCouponForSubtotal(coupon(), 10000, now).status).toBe("valid");
    expect(validateCouponForSubtotal(coupon({ isActive: false }), 10000, now)).toMatchObject({
      status: "invalid",
      code: "coupon_inactive"
    });
    expect(
      validateCouponForSubtotal(coupon({ endsAt: new Date("2026-01-01") }), 10000, now)
    ).toMatchObject({ status: "invalid", code: "coupon_expired" });
    expect(
      validateCouponForSubtotal(coupon({ startsAt: new Date("2099-01-01") }), 10000, now)
    ).toMatchObject({ status: "invalid", code: "coupon_scheduled" });
    expect(validateCouponForSubtotal(coupon({ maxUses: 2, usedCount: 2 }), 10000, now)).toMatchObject({
      status: "invalid",
      code: "coupon_exhausted"
    });
    expect(validateCouponForSubtotal(coupon({ minimumSubtotalCents: 20000 }), 10000, now)).toMatchObject({
      status: "invalid",
      code: "coupon_minimum_subtotal_not_met"
    });
  });

  it("calculates percentage discounts with deterministic cent rounding", () => {
    expect(calculateCouponDiscountCents(coupon({ type: "percentage", value: 12.5 }), 9999)).toBe(1250);
  });

  it("calculates fixed discounts and never exceeds subtotal", () => {
    expect(calculateCouponDiscountCents(coupon({ type: "fixed_amount", value: 5000 }), 15990)).toBe(5000);
    expect(calculateCouponDiscountCents(coupon({ type: "fixed_amount", value: 5000 }), 3000)).toBe(3000);
  });

  it("keeps free shipping valid while leaving item discount untouched", () => {
    const calculation = calculateCartCoupon(coupon({ type: "free_shipping", value: 0 }), 15990, now);

    expect(calculation.discountCents).toBe(0);
    expect(calculation.partialTotalCents).toBe(15990);
    expect(calculation.coupon?.type).toBe("free_shipping");
    expect(calculation.messages).toEqual([]);
  });
});

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  const date = new Date("2026-01-10T12:00:00.000Z");
  return {
    id: "coupon-test",
    code: "DEV10",
    type: "percentage",
    value: 10,
    isActive: true,
    startsAt: date,
    endsAt: null,
    maxUses: null,
    usedCount: 0,
    minimumSubtotalCents: null,
    createdAt: date,
    updatedAt: date,
    ...overrides
  };
}
