import { z } from "zod";

export const postalCodeSchema = z
  .string()
  .trim()
  .min(8, "CEP invalido.")
  .max(9, "CEP invalido.")
  .transform((value) => value.replace(/\D/g, ""));

export const shippingQuoteSchema = z.object({
  postalCode: postalCodeSchema
});

export const shippingRuleSchema = z.object({
  name: z.string().trim().min(2),
  uf: z.string().trim().length(2).nullable(),
  postalCodeStart: postalCodeSchema.nullable(),
  postalCodeEnd: postalCodeSchema.nullable(),
  priceCents: z.number().int().nonnegative(),
  estimatedDays: z.number().int().nonnegative().nullable(),
  priority: z.number().int(),
  isActive: z.boolean()
});

export const shippingSelectionSchema = z.object({
  quoteId: z.string().trim().min(1),
  optionId: z.string().trim().min(1),
  postalCode: postalCodeSchema
});
