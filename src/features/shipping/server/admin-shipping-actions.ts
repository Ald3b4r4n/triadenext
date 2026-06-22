"use server";

import { revalidatePath } from "next/cache";
import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";
import { shippingRuleSchema } from "../schemas";
import type { ShippingManualRule } from "../types";
import { createShippingRepository } from "./shipping-repository";

const shippingRepository = createShippingRepository();

export type AdminShippingActionResult =
  | { status: "success"; message: string; rules?: ShippingManualRule[] }
  | { status: "validation_error"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "blocked"; message: string };

export async function listShippingRulesAction(): Promise<AdminShippingActionResult> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") {
    return toPolicyResult(policyMessage(policy));
  }
  return { status: "success", message: "Regras carregadas.", rules: await shippingRepository.listManualRules() };
}

export async function createShippingRuleAction(formData: FormData): Promise<AdminShippingActionResult> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") {
    return toPolicyResult(policyMessage(policy));
  }
  const parsed = shippingRuleSchema.safeParse({
    name: formData.get("name"),
    uf: parseNullableString(formData.get("uf")),
    postalCodeStart: parseNullableString(formData.get("postalCodeStart")),
    postalCodeEnd: parseNullableString(formData.get("postalCodeEnd")),
    priceCents: Number(formData.get("priceCents") ?? 0),
    estimatedDays: parseNullableNumber(formData.get("estimatedDays")),
    priority: Number(formData.get("priority") ?? 0),
    isActive: formData.get("isActive") === "on"
  });
  if (!parsed.success) {
    return { status: "validation_error", message: "Dados inválidos para regra de frete." };
  }
  await shippingRepository.createManualRule(parsed.data);
  revalidatePath("/admin/frete");
  return { status: "success", message: "Regra criada." };
}

export async function createShippingRuleFormAction(formData: FormData): Promise<void> {
  await createShippingRuleAction(formData);
}

export async function updateShippingRuleAction(formData: FormData): Promise<AdminShippingActionResult> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") {
    return toPolicyResult(policyMessage(policy));
  }
  const id = String(formData.get("id") ?? "");
  const parsed = shippingRuleSchema.safeParse({
    name: formData.get("name"),
    uf: parseNullableString(formData.get("uf")),
    postalCodeStart: parseNullableString(formData.get("postalCodeStart")),
    postalCodeEnd: parseNullableString(formData.get("postalCodeEnd")),
    priceCents: Number(formData.get("priceCents") ?? 0),
    estimatedDays: parseNullableNumber(formData.get("estimatedDays")),
    priority: Number(formData.get("priority") ?? 0),
    isActive: formData.get("isActive") === "on"
  });
  if (!parsed.success) {
    return { status: "validation_error", message: "Dados inválidos para regra de frete." };
  }
  await shippingRepository.updateManualRule(id, parsed.data);
  revalidatePath("/admin/frete");
  return { status: "success", message: "Regra atualizada." };
}

export async function updateShippingRuleFormAction(formData: FormData): Promise<void> {
  await updateShippingRuleAction(formData);
}

function parseNullableString(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : text;
}

function parseNullableNumber(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : Number(text);
}

function toPolicyResult(message: string): AdminShippingActionResult {
  if (message.includes("bloqueada")) {
    return { status: "blocked", message };
  }
  return { status: "forbidden", message };
}
