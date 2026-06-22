import { z } from "zod";

export const allowedProductImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxProductImageSizeBytes = 5 * 1024 * 1024;

export const productImageUploadSchema = z.object({
  productId: z.string().min(1),
  file: z
    .custom<File>((value) => value instanceof File, "Informe um arquivo de imagem.")
    .refine((file) => allowedProductImageTypes.includes(file.type as never), {
      message: "Tipo de imagem inválido. Use JPEG, PNG ou WebP."
    })
    .refine((file) => file.size <= maxProductImageSizeBytes, {
      message: "Imagem acima do limite de 5 MB."
    }),
  altText: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
  isCover: z.boolean().default(false),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional()
});
