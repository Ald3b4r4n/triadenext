import { z } from "zod";

export const startPaymentSchema = z.object({
  orderId: z.string().min(1, "Pedido obrigatorio.")
});

export type StartPaymentInput = z.infer<typeof startPaymentSchema>;

export const paymentStatusSchema = z.object({
  orderId: z.string().min(1, "Pedido obrigatorio.")
});

export type PaymentStatusInput = z.infer<typeof paymentStatusSchema>;
