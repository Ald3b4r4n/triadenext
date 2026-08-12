"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";
import { createProductCategory } from "./product-service";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da categoria."),
  slug: z.string().trim().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use um slug válido."),
  description: z.string().trim().max(240).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(false)
});

export async function createCategoryAction(formData: FormData): Promise<void> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") {
    throw new Error(policyMessage(policy));
  }

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on"
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos para a categoria.");
  }

  const result = await createProductCategory(parsed.data);
  if (result.status === "blocked") {
    throw new Error(result.message);
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos/novo");
}
