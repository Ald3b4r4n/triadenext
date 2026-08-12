"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticated, policyMessage } from "@/features/auth/server/policies";
import { customerAccountSchema } from "../schemas";
import { getCustomerAccountData, saveCustomerAccountData } from "./account-repository";

export async function getCurrentCustomerAccount() {
  const policy = await requireAuthenticated();
  return policy.status === "allowed" ? getCustomerAccountData(policy.userId) : null;
}

export async function saveCustomerAccountAction(formData: FormData): Promise<void> {
  const policy = await requireAuthenticated();
  if (policy.status !== "allowed") throw new Error(policyMessage(policy));
  const parsed = customerAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados cadastrais inválidos.");
  const result = await saveCustomerAccountData(policy.userId, parsed.data);
  if (result.status !== "success") throw new Error(result.message);
  revalidatePath("/minha-conta");
  revalidatePath("/checkout");
}
