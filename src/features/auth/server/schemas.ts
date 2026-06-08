import { z } from "zod";

const emailSchema = z.string().trim().email("Informe um e-mail valido.").toLowerCase();
const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter letras.")
  .regex(/[0-9]/, "A senha deve conter numeros.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha."),
  returnTo: z.string().optional()
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120, "Nome muito longo."),
  email: emailSchema,
  password: passwordSchema,
  role: z.unknown().optional(),
  returnTo: z.string().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
