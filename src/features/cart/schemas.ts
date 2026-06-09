import { z } from "zod";

const idSchema = z.string().min(1, "Identificador obrigatorio.");

export const addCartItemSchema = z.object({
  productId: idSchema,
  quantity: z.coerce.number().int().min(1).default(1)
});

export const updateCartItemQuantitySchema = z.object({
  itemId: idSchema,
  quantity: z.coerce.number().int().min(1)
});

export const removeCartItemSchema = z.object({
  itemId: idSchema
});

export const applyCouponToCartSchema = z.object({
  code: z.string().trim().min(1, "Codigo obrigatorio.").max(64, "Codigo muito longo.")
});

const postalCodeSchema = z
  .string()
  .trim()
  .min(8, "CEP invalido.")
  .max(9, "CEP invalido.");

export const quoteShippingSchema = z.object({
  postalCode: postalCodeSchema
});

export const selectShippingOptionSchema = z.object({
  quoteId: z.string().trim().min(1, "Cotacao obrigatoria."),
  optionId: z.string().trim().min(1, "Opcao obrigatoria."),
  postalCode: postalCodeSchema
});
