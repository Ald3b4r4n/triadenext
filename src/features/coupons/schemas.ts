import { z } from "zod";

const couponCodeSchema = z
  .string()
  .trim()
  .min(1, "Código obrigatório.")
  .max(64, "Código muito longo.");

export const applyCouponSchema = z.object({
  code: couponCodeSchema
});

export const removeCouponSchema = z.object({
  intent: z.literal("remove").default("remove")
});

export const adminCouponSchema = z
  .object({
    code: couponCodeSchema,
    type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
    value: z.coerce.number().nonnegative(),
    isActive: z.coerce.boolean().default(true),
    startsAt: z.coerce.date().nullable().optional(),
    endsAt: z.coerce.date().nullable().optional(),
    maxUses: z.coerce.number().int().min(1).nullable().optional(),
    minimumSubtotalCents: z.coerce.number().int().min(0).nullable().optional()
  })
  .superRefine((input, ctx) => {
    if (input.type === "percentage" && (input.value <= 0 || input.value > 100)) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Percentual deve ficar entre 1 e 100."
      });
    }

    if (input.type === "fixed_amount" && (!Number.isInteger(input.value) || input.value <= 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Valor fixo deve ser informado em centavos inteiros."
      });
    }
  });

export const updateAdminCouponSchema = adminCouponSchema.extend({
  id: z.string().min(1, "Cupom obrigatorio.")
});
