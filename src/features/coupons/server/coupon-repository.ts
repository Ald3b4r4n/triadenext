import "server-only";

import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { assertCanMutateRealData, runtimeMessages } from "@/lib/runtime-mode";
import { normalizeCouponCode } from "../domain";
import { devCoupons } from "./coupon-fixtures";
import type { Coupon, CouponAdminInput, CouponMutationResult } from "../types";

export type CouponRepository = {
  findCouponByNormalizedCode(code: string): Promise<Coupon | null>;
  findCouponById(id: string): Promise<Coupon | null>;
  listCouponsForAdmin(): Promise<Coupon[]>;
  createCoupon(input: CouponAdminInput): Promise<CouponMutationResult>;
  updateCoupon(id: string, input: CouponAdminInput): Promise<CouponMutationResult>;
  incrementUsedCount(id: string): Promise<boolean>;
};

export function createCouponRepository(): CouponRepository {
  if (db === null) {
    return createFallbackCouponRepository();
  }

  return createDrizzleCouponRepository();
}

function createFallbackCouponRepository(): CouponRepository {
  const store = getFallbackCouponStore();

  return {
    async findCouponByNormalizedCode(code) {
      const normalized = normalizeCouponCode(code);
      return store.get(normalized) ?? null;
    },
    async findCouponById(id) {
      return [...store.values()].find((coupon) => coupon.id === id) ?? null;
    },
    async listCouponsForAdmin() {
      return [...store.values()].sort((a, b) => a.code.localeCompare(b.code));
    },
    async createCoupon(input) {
      const coupon = toFallbackCoupon(input, `coupon-dev-${normalizeCouponCode(input.code).toLowerCase()}`);
      store.set(coupon.code, coupon);
      return {
        status: "dev_fallback",
        coupon,
        message:
          "Cupom validado para teste local. A gravação definitiva depende da configuração de produção."
      };
    },
    async updateCoupon(id, input) {
      const existing = [...store.values()].find((coupon) => coupon.id === id);
      const coupon = toFallbackCoupon(input, existing?.id ?? id);
      if (existing) {
        store.delete(existing.code);
      }
      store.set(coupon.code, coupon);
      return {
        status: "dev_fallback",
        coupon,
        message:
          "Cupom atualizado para teste local. A gravação definitiva depende da configuração de produção."
      };
    },
    async incrementUsedCount(id) {
      const coupon = [...store.values()].find((candidate) => candidate.id === id);
      if (!coupon) {
        return false;
      }
      store.set(coupon.code, {
        ...coupon,
        usedCount: coupon.usedCount + 1,
        updatedAt: new Date()
      });
      return true;
    }
  };
}

function createDrizzleCouponRepository(): CouponRepository {
  if (db === null) {
    return createFallbackCouponRepository();
  }

  const database = db;

  return {
    async findCouponByNormalizedCode(code) {
      const [row] = await database
        .select()
        .from(coupons)
        .where(eq(coupons.code, normalizeCouponCode(code)))
        .limit(1);
      return row ? toCoupon(row) : null;
    },
    async findCouponById(id) {
      const [row] = await database.select().from(coupons).where(eq(coupons.id, id)).limit(1);
      return row ? toCoupon(row) : null;
    },
    async listCouponsForAdmin() {
      const rows = await database.select().from(coupons).orderBy(asc(coupons.code));
      return rows.map(toCoupon);
    },
    async createCoupon(input) {
      const guardrail = assertCanMutateRealData();
      if (!guardrail.allowed) {
        return { status: "blocked", coupon: null, message: guardrail.message };
      }

      const [created] = await database
        .insert(coupons)
        .values(toCouponRow(input))
        .returning();

      return {
        status: "persisted",
        coupon: toCoupon(created),
        message: "Cupom persistido em Neon/Drizzle."
      };
    },
    async updateCoupon(id, input) {
      const guardrail = assertCanMutateRealData();
      if (!guardrail.allowed) {
        return { status: "blocked", coupon: null, message: guardrail.message };
      }

      const [updated] = await database
        .update(coupons)
        .set({ ...toCouponRow(input), updatedAt: new Date() })
        .where(eq(coupons.id, id))
        .returning();

      if (!updated) {
        return { status: "blocked", coupon: null, message: "Cupom não encontrado." };
      }

      return {
        status: "persisted",
        coupon: toCoupon(updated),
        message: "Cupom atualizado em Neon/Drizzle."
      };
    },
    async incrementUsedCount(id) {
      const [updated] = await database
        .update(coupons)
        .set({
          usedCount: sql`${coupons.usedCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(coupons.id, id))
        .returning({ id: coupons.id });
      return Boolean(updated);
    }
  };
}

function toCoupon(row: typeof coupons.$inferSelect): Coupon {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    isActive: row.isActive,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    maxUses: row.maxUses,
    usedCount: row.usedCount,
    minimumSubtotalCents: row.minimumSubtotalCents,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function toCouponRow(input: CouponAdminInput) {
  return {
    code: normalizeCouponCode(input.code),
    type: input.type,
    value:
      input.type === "fixed_amount"
        ? input.value.toFixed(2)
        : input.value.toString(),
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    maxUses: input.maxUses,
    usedCount: 0,
    minimumSubtotalCents: input.minimumSubtotalCents,
    isActive: input.isActive
  };
}

function toFallbackCoupon(input: CouponAdminInput, id: string): Coupon {
  const now = new Date();
  return {
    id,
    code: normalizeCouponCode(input.code),
    type: input.type,
    value: input.value,
    isActive: input.isActive,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    maxUses: input.maxUses,
    usedCount: 0,
    minimumSubtotalCents: input.minimumSubtotalCents,
    createdAt: now,
    updatedAt: now
  };
}

function getFallbackCouponStore() {
  const globalStore = globalThis as typeof globalThis & {
    __triadeCouponFallbackStore?: Map<string, Coupon>;
  };

  if (!globalStore.__triadeCouponFallbackStore) {
    globalStore.__triadeCouponFallbackStore = new Map(
      devCoupons.map((coupon) => [coupon.code, coupon])
    );
  }

  return globalStore.__triadeCouponFallbackStore;
}

export function couponUnavailableMessage() {
  return runtimeMessages.cartUnavailable;
}
