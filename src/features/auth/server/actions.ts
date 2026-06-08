"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "./auth";
import { loginSchema, signupSchema } from "./schemas";
import { validateReturnTo } from "./session";
import { getRuntimeMode } from "@/lib/runtime-mode";

export type AuthActionState = {
  status: "idle" | "error";
  message: string;
  fields?: Record<string, string>;
};

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    returnTo: validateReturnTo(formData.get("returnTo"))
  });

  if (!parsed.success) {
    return toAuthErrorState(parsed.error.flatten().fieldErrors);
  }

  if (!getRuntimeMode().isAuthReady) {
    return { status: "error", message: "Auth real indisponivel neste ambiente." };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password
      },
      headers: await headers()
    });
  } catch {
    return {
      status: "error",
      message: "Credenciais invalidas ou auth indisponivel."
    };
  }

  redirect(validateReturnTo(parsed.data.returnTo));
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    returnTo: validateReturnTo(formData.get("returnTo"))
  });

  if (!parsed.success) {
    return toAuthErrorState(parsed.error.flatten().fieldErrors);
  }

  if (!getRuntimeMode().isAuthReady) {
    return { status: "error", message: "Auth real indisponivel neste ambiente." };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password
      },
      headers: await headers()
    });
  } catch {
    return {
      status: "error",
      message: "Nao foi possivel concluir o cadastro. Revise os dados e tente novamente."
    };
  }

  redirect(validateReturnTo(parsed.data.returnTo || "/minha-conta"));
}

export async function logoutAction() {
  try {
    await auth.api.signOut({
      headers: await headers()
    });
  } catch {
    redirect("/login");
  }

  redirect("/login");
}

function toAuthErrorState(fieldErrors: Record<string, string[] | undefined>): AuthActionState {
  return {
    status: "error",
    message: "Revise os campos destacados antes de continuar.",
    fields: Object.fromEntries(
      Object.entries(fieldErrors)
        .filter(([, messages]) => messages !== undefined && messages.length > 0)
        .map(([field, messages]) => [field, messages?.[0] ?? "Campo invalido."])
    )
  };
}
