"use server";

import { revalidatePath } from "next/cache";
import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";
import { productFormDataToObject, productFormSchema } from "../schemas";
import { createAdminProduct, updateAdminProduct } from "./product-service";

export type ProductActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fields?: Record<string, string>;
};

export async function createProductAction(
  _previousState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const policy = await requireAdminLike();

  if (policy.status !== "allowed") {
    return {
      status: "error",
      message: policyMessage(policy)
    };
  }

  const parsed = productFormSchema.safeParse(productFormDataToObject(formData));

  if (!parsed.success) {
    return toErrorState(parsed.error.flatten().fieldErrors);
  }

  const result = await createAdminProduct(parsed.data);
  const status = result.status === "blocked" ? "error" : "success";
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");

  return {
    status,
    message: result.message
  };
}

export async function updateProductAction(
  id: string,
  _previousState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const policy = await requireAdminLike();

  if (policy.status !== "allowed") {
    return {
      status: "error",
      message: policyMessage(policy)
    };
  }

  const parsed = productFormSchema.safeParse(productFormDataToObject(formData));

  if (!parsed.success) {
    return toErrorState(parsed.error.flatten().fieldErrors);
  }

  const result = await updateAdminProduct(id, parsed.data);
  const status = result.status === "blocked" ? "error" : "success";
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}/editar`);
  revalidatePath("/produtos");

  return {
    status,
    message: result.message
  };
}

function toErrorState(fieldErrors: Record<string, string[] | undefined>): ProductActionState {
  return {
    status: "error",
    message: "Revise os campos destacados antes de salvar.",
    fields: Object.fromEntries(
      Object.entries(fieldErrors)
        .filter(([, messages]) => messages !== undefined && messages.length > 0)
        .map(([field, messages]) => [field, messages?.[0] ?? "Campo invalido."])
    )
  };
}
