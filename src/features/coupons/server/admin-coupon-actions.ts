"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";
import { normalizeCouponCode } from "../domain";
import { adminCouponSchema, updateAdminCouponSchema } from "../schemas";
import type { CouponAdminInput, CouponView } from "../types";
import {
  createAdminCoupon,
  listAdminCoupons,
  updateAdminCoupon
} from "./coupon-service";

export type AdminCouponActionResult =
  | { status: "success"; message: string; coupons?: CouponView[] }
  | { status: "validation_error"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "blocked"; message: string };

export async function listCouponsAction(): Promise<AdminCouponActionResult> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") {
    return toPolicyResult(policyMessage(policy));
  }

  return {
    status: "success",
    message: "Cupons carregados.",
    coupons: await listAdminCoupons()
  };
}

export async function createCouponAction(formData: FormData): Promise<AdminCouponActionResult> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") {
    return toPolicyResult(policyMessage(policy));
  }

  const parsed = adminCouponSchema.safeParse(formDataToCouponInput(formData));
  if (!parsed.success) {
    return { status: "validation_error", message: "Dados inválidos para cupom." };
  }

  const result = await createAdminCoupon({
    ...toAdminInput(parsed.data),
    code: normalizeCouponCode(parsed.data.code)
  });
  revalidatePath("/admin/cupons");

  if (result.status === "blocked") {
    return { status: "blocked", message: result.message };
  }

  return { status: "success", message: result.message };
}

export async function updateCouponAction(formData: FormData): Promise<AdminCouponActionResult> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") {
    return toPolicyResult(policyMessage(policy));
  }

  const parsed = updateAdminCouponSchema.safeParse({
    ...formDataToCouponInput(formData),
    id: formData.get("id")
  });
  if (!parsed.success) {
    return { status: "validation_error", message: "Dados inválidos para cupom." };
  }

  const { id, ...input } = parsed.data;
  const result = await updateAdminCoupon(id, {
    ...toAdminInput(input),
    code: normalizeCouponCode(input.code)
  });
  revalidatePath("/admin/cupons");

  if (result.status === "blocked") {
    return { status: "blocked", message: result.message };
  }

  return { status: "success", message: result.message };
}

export async function createCouponFormAction(formData: FormData): Promise<void> {
  const result = await createCouponAction(formData);
  if (result.status === "success") {
    redirect("/admin/cupons");
  }
}

export async function updateCouponFormAction(formData: FormData): Promise<void> {
  const result = await updateCouponAction(formData);
  if (result.status === "success") {
    redirect("/admin/cupons");
  }
}

function formDataToCouponInput(formData: FormData): CouponAdminInput {
  const type = formData.get("type");
  return {
    code: String(formData.get("code") ?? ""),
    type:
      type === "fixed_amount" || type === "free_shipping" || type === "percentage"
        ? type
        : "percentage",
    value: Number(formData.get("value") ?? 0),
    isActive: formData.get("isActive") === "on",
    startsAt: parseOptionalDate(formData.get("startsAt")),
    endsAt: parseOptionalDate(formData.get("endsAt")),
    maxUses: parseOptionalInteger(formData.get("maxUses")),
    minimumSubtotalCents: parseOptionalInteger(formData.get("minimumSubtotalCents"))
  };
}

function toAdminInput(input: {
  code: string;
  type: CouponAdminInput["type"];
  value: number;
  isActive: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  maxUses?: number | null;
  minimumSubtotalCents?: number | null;
}): CouponAdminInput {
  return {
    code: input.code,
    type: input.type,
    value: input.value,
    isActive: input.isActive,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    maxUses: input.maxUses ?? null,
    minimumSubtotalCents: input.minimumSubtotalCents ?? null
  };
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return new Date(value);
}

function parseOptionalInteger(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return Number(value);
}

function toPolicyResult(message: string): AdminCouponActionResult {
  if (message.includes("bloqueada")) {
    return { status: "blocked", message };
  }

  return { status: "forbidden", message };
}
