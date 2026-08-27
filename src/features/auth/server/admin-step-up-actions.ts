"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { grantAdminStepUp, validateAdminReturnTo } from "./admin-step-up";
import { getCurrentSession } from "./session";

export type AdminStepUpResult =
  | { status: "success"; returnTo: string }
  | { status: "error"; message: string };

export async function verifyAdminStepUpAction(
  code: string,
  returnTo: string
): Promise<AdminStepUpResult> {
  const session = await getCurrentSession();
  if (
    session.status !== "authenticated" ||
    (session.role !== "admin" && session.role !== "manager") ||
    !session.twoFactorEnabled
  ) {
    return {
      status: "error",
      message: "Sua sessão administrativa não está disponível. Entre novamente."
    };
  }

  const normalizedCode = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalizedCode)) {
    return { status: "error", message: "Informe o código de 6 dígitos do autenticador." };
  }

  try {
    await auth.api.verifyTOTP({
      body: { code: normalizedCode, trustDevice: false },
      headers: await headers()
    });
    await grantAdminStepUp(session.userId, session.sessionId);
    return { status: "success", returnTo: validateAdminReturnTo(returnTo) };
  } catch {
    return {
      status: "error",
      message: "Código inválido ou expirado. Confira o aplicativo e tente novamente."
    };
  }
}
