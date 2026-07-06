import "server-only";

import { getRuntimeMode } from "@/lib/runtime-mode";
import {
  calculateCartCoupon,
  normalizeCouponCode,
  toCouponView,
  validateCouponForSubtotal
} from "../domain";
import type {
  Coupon,
  CouponAdminInput,
  CouponCalculation,
  CouponMutationResult,
  CouponValidationResult,
  CouponView
} from "../types";
import { createCouponRepository } from "./coupon-repository";

const couponRepository = createCouponRepository();

export async function findCouponByCode(code: string): Promise<Coupon | null> {
  return couponRepository.findCouponByNormalizedCode(normalizeCouponCode(code));
}

export async function findCouponById(
  id: string | null
): Promise<Coupon | null> {
  if (!id) {
    return null;
  }

  return couponRepository.findCouponById(id);
}

export async function validateCouponForCart(input: {
  code: string;
  subtotalCents: number;
  now?: Date;
}): Promise<CouponValidationResult> {
  if (!getRuntimeMode().hasDatabase && !isDevOrTest()) {
    return {
      status: "invalid",
      code: "database_unavailable",
      message: "Cupom indisponível neste ambiente sem banco."
    };
  }

  const coupon = await findCouponByCode(input.code);
  return validateCouponForSubtotal(coupon, input.subtotalCents, input.now);
}

export async function calculateAppliedCoupon(input: {
  couponId: string | null;
  subtotalCents: number;
  now?: Date;
}): Promise<CouponCalculation> {
  const coupon = await findCouponById(input.couponId);
  return calculateCartCoupon(coupon, input.subtotalCents, input.now);
}

export async function listAdminCoupons(): Promise<CouponView[]> {
  const coupons = await couponRepository.listCouponsForAdmin();
  return coupons.map((coupon) => toCouponView(coupon));
}

export async function createAdminCoupon(
  input: CouponAdminInput
): Promise<CouponMutationResult> {
  return couponRepository.createCoupon(input);
}

export async function updateAdminCoupon(
  id: string,
  input: CouponAdminInput
): Promise<CouponMutationResult> {
  return couponRepository.updateCoupon(id, input);
}

function isDevOrTest() {
  const mode = getRuntimeMode();
  return (
    mode.appEnvironment === "development" || mode.appEnvironment === "test"
  );
}
