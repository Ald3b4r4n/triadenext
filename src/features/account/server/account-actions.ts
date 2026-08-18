"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthenticated, policyMessage } from "@/features/auth/server/policies";
import { validateReturnTo } from "@/features/auth/server/session";
import { customerAccountSchema } from "../schemas";
import { getCustomerAccountData, saveCustomerAccountData } from "./account-repository";

export async function getCurrentCustomerAccount() {
  const policy = await requireAuthenticated();
  return policy.status === "allowed" ? getCustomerAccountData(policy.userId) : null;
}

export type CustomerAccountActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function saveCustomerAccountAction(
  _previousState: CustomerAccountActionState,
  formData: FormData
): Promise<CustomerAccountActionState> {
  const policy = await requireAuthenticated();
  if (policy.status !== "allowed") {
    return { status: "error", message: policyMessage(policy) };
  }

  const parsed = customerAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Confira os dados informados."
    };
  }

  let result: Awaited<ReturnType<typeof saveCustomerAccountData>>;
  try {
    result = await saveCustomerAccountData(policy.userId, parsed.data);
    if (result.status !== "success") {
      return { status: "error", message: result.message };
    }
  } catch {
    return {
      status: "error",
      message: "Não foi possível salvar seus dados agora. Tente novamente em instantes."
    };
  }

  revalidatePath("/minha-conta");
  revalidatePath("/checkout");

  const requestedReturnTo = formData.get("returnTo");
  if (typeof requestedReturnTo === "string" && requestedReturnTo.trim()) {
    redirect(validateReturnTo(requestedReturnTo));
  }

  return { status: "success", message: result.message };
}
