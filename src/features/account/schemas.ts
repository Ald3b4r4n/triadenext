import { z } from "zod";
import { normalizeBrazilPhone } from "@/features/checkout/phone";

export const customerAccountSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo."),
  phone: z.string().transform(normalizeBrazilPhone).refine((value) => /^\d{10,11}$/.test(value), "Informe um telefone válido com DDD."),
  documentType: z.enum(["cpf", "cnpj"]),
  documentNumber: z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length === 11 || value.length === 14, "Informe um CPF ou CNPJ válido."),
  birthDate: z.string().optional().nullable(),
  recipient: z.string().trim().min(3, "Informe o destinatário."),
  postalCode: z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length === 8, "Informe um CEP válido."),
  state: z.string().trim().length(2, "Informe a UF."),
  city: z.string().trim().min(2, "Informe a cidade."),
  district: z.string().trim().min(2, "Informe o bairro."),
  street: z.string().trim().min(2, "Informe o logradouro."),
  number: z.string().trim().min(1, "Informe o número."),
  complement: z.string().trim().optional().nullable()
});

export type CustomerAccountInput = z.infer<typeof customerAccountSchema>;
