"use server";

import { revalidatePath } from "next/cache";
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
  const parsed = productFormSchema.safeParse(productFormDataToObject(formData));

  if (!parsed.success) {
    return toErrorState(parsed.error.flatten().fieldErrors);
  }

  const result = await createAdminProduct(parsed.data);
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");

  return {
    status: "success",
    message: result.message
  };
}

export async function updateProductAction(
  id: string,
  _previousState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = productFormSchema.safeParse(productFormDataToObject(formData));

  if (!parsed.success) {
    return toErrorState(parsed.error.flatten().fieldErrors);
  }

  const result = await updateAdminProduct(id, parsed.data);
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}/editar`);
  revalidatePath("/produtos");

  return {
    status: "success",
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
