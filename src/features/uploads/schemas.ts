import { z } from "zod";

export const allowedProductImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxProductImageSizeBytes = 5 * 1024 * 1024;

export type AllowedProductImageType = (typeof allowedProductImageTypes)[number];

export async function detectProductImageType(
  file: File
): Promise<AllowedProductImageType | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

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
