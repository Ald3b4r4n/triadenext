import { z } from "zod";

export const orderCustomerSnapshotSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo."),
  email: z.string().trim().email("E-mail invalido."),
  phone: z.string().trim().min(8, "Informe um telefone/WhatsApp valido.")
});

export const orderAddressSnapshotSchema = z.object({
  recipient: z.string().trim().min(3, "Informe o destinatario."),
  postalCode: z.string().trim().min(8, "Informe o CEP."),
  state: z.string().trim().length(2, "Informe a UF."),
  city: z.string().trim().min(2, "Informe a cidade."),
  district: z.string().trim().min(2, "Informe o bairro."),
  street: z.string().trim().min(2, "Informe o logradouro."),
  number: z.string().trim().min(1, "Informe o numero."),
  complement: z.string().trim().optional().nullable(),
  country: z.literal("BR").default("BR")
});

export const checkoutFormSchema = z.object({
  fullName: orderCustomerSnapshotSchema.shape.fullName,
  phone: orderCustomerSnapshotSchema.shape.phone,
  postalCode: orderAddressSnapshotSchema.shape.postalCode,
  state: orderAddressSnapshotSchema.shape.state,
  city: orderAddressSnapshotSchema.shape.city,
  district: orderAddressSnapshotSchema.shape.district,
  street: orderAddressSnapshotSchema.shape.street,
  number: orderAddressSnapshotSchema.shape.number,
  complement: z.string().trim().optional().nullable(),
  recipient: z.string().trim().optional().nullable()
});

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
