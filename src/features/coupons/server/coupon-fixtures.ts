import type { Coupon } from "../types";

const fixtureDate = new Date("2026-01-10T12:00:00.000Z");
const futureDate = new Date("2099-01-10T12:00:00.000Z");
const pastExpiry = new Date("2026-01-01T12:00:00.000Z");

export const devCoupons: Coupon[] = [
  {
    id: "coupon-dev-10",
    code: "DEV10",
    type: "percentage",
    value: 10,
    isActive: true,
    startsAt: fixtureDate,
    endsAt: null,
    maxUses: null,
    usedCount: 0,
    minimumSubtotalCents: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "coupon-dev-fixed",
    code: "FIXO5000",
    type: "fixed_amount",
    value: 5000,
    isActive: true,
    startsAt: fixtureDate,
    endsAt: null,
    maxUses: null,
    usedCount: 0,
    minimumSubtotalCents: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "coupon-dev-minimum",
    code: "MINIMO200",
    type: "percentage",
    value: 15,
    isActive: true,
    startsAt: fixtureDate,
    endsAt: null,
    maxUses: null,
    usedCount: 0,
    minimumSubtotalCents: 20000,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "coupon-dev-inactive",
    code: "INATIVO",
    type: "percentage",
    value: 10,
    isActive: false,
    startsAt: fixtureDate,
    endsAt: null,
    maxUses: null,
    usedCount: 0,
    minimumSubtotalCents: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "coupon-dev-future",
    code: "FUTURO",
    type: "percentage",
    value: 10,
    isActive: true,
    startsAt: futureDate,
    endsAt: null,
    maxUses: null,
    usedCount: 0,
    minimumSubtotalCents: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "coupon-dev-expired",
    code: "EXPIRADO",
    type: "percentage",
    value: 10,
    isActive: true,
    startsAt: fixtureDate,
    endsAt: pastExpiry,
    maxUses: null,
    usedCount: 0,
    minimumSubtotalCents: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "coupon-dev-exhausted",
    code: "ESGOTADO",
    type: "percentage",
    value: 10,
    isActive: true,
    startsAt: fixtureDate,
    endsAt: null,
    maxUses: 1,
    usedCount: 1,
    minimumSubtotalCents: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "coupon-dev-free-shipping",
    code: "FRETEGRATIS",
    type: "free_shipping",
    value: 0,
    isActive: true,
    startsAt: fixtureDate,
    endsAt: null,
    maxUses: null,
    usedCount: 0,
    minimumSubtotalCents: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  }
];
