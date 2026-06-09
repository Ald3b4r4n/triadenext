export type CouponType = "percentage" | "fixed_amount" | "free_shipping";
export type LegacyCouponType = "percent" | "fixed";

export type CouponStatus = "active" | "inactive" | "scheduled" | "expired" | "exhausted";

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  usedCount: number;
  minimumSubtotalCents: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CouponView = {
  id: string;
  code: string;
  type: CouponType;
  status: CouponStatus;
  valueLabel: string;
  minimumSubtotalCents: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  usedCount: number;
  isPreparedBenefit: boolean;
};

export type CouponCalculation = {
  coupon: CouponView | null;
  discountCents: number;
  partialTotalCents: number;
  messages: string[];
};

export type CouponValidationResult =
  | { status: "valid"; coupon: Coupon; messages: string[] }
  | { status: "invalid"; code: CouponErrorCode; message: string; coupon?: Coupon };

export type CouponErrorCode =
  | "coupon_not_found"
  | "coupon_inactive"
  | "coupon_scheduled"
  | "coupon_expired"
  | "coupon_exhausted"
  | "coupon_minimum_subtotal_not_met"
  | "coupon_type_unavailable"
  | "coupon_invalid_value"
  | "database_unavailable"
  | "validation_error"
  | "forbidden";

export type CouponPersistence = "real" | "dev_fallback" | "blocked";

export type CouponMutationResult =
  | { status: "persisted"; coupon: Coupon; message: string }
  | { status: "dev_fallback"; coupon: Coupon; message: string }
  | { status: "blocked"; coupon: null; message: string };

export type CouponAdminInput = {
  code: string;
  type: CouponType;
  value: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  minimumSubtotalCents: number | null;
};
