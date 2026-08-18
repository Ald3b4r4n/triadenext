"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { auth } from "./auth";
import { loginSchema, signupSchema } from "./schemas";
import { validateReturnTo } from "./session";
import { getRuntimeMode } from "@/lib/runtime-mode";
import { db } from "@/db/client";
import { accounts, users } from "@/db/schema";
import { env } from "@/lib/env";
import {
  expireGuestCartToken,
  getGuestCartTokenForMerge
} from "@/features/cart/server/cart-session";
import { mergeGuestCartIntoUser } from "@/features/cart/server/cart-service";
import { getCurrentSession } from "./session";

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
    passwordConfirmation: formData.get("passwordConfirmation"),
    returnTo: validateReturnTo(formData.get("returnTo"))
  });

  if (!parsed.success) {
    return toAuthErrorState(parsed.error.flatten().fieldErrors);
  }

  if (!getRuntimeMode().isAuthReady) {
    return {
      status: "error",
      message: "Auth real indisponível neste ambiente."
    };
  }

  try {
    const guestToken = await getGuestCartTokenForMerge();
    const requestHeaders = await headers();
    let signedIn;

    try {
      signedIn = await signInWithEmail({
        email: parsed.data.email,
        password: parsed.data.password,
        requestHeaders
      });
    } catch (error) {
      const recovered = await recoverLegacyAdminCredential({
        email: parsed.data.email,
        password: parsed.data.password
      });

      if (!recovered) throw error;

      signedIn = await signInWithEmail({
        email: parsed.data.email,
        password: parsed.data.password,
        requestHeaders
      });
    }
    if ("twoFactorRedirect" in signedIn && signedIn.twoFactorRedirect) {
      const returnTo = validateReturnTo(parsed.data.returnTo);
      redirect(`/verificar-2fa?returnTo=${encodeURIComponent(returnTo)}`);
    }

    if ("user" in signedIn && signedIn.user.id && guestToken) {
      await mergeGuestCartIntoUser({ userId: signedIn.user.id, guestToken });
      await expireGuestCartToken();
    }
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    return {
      status: "error",
      message: describeLoginError(error)
    };
  }

  redirect(validateReturnTo(parsed.data.returnTo));
}

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
    role: formData.get("role"),
    returnTo: validateReturnTo(formData.get("returnTo"))
  });

  if (!parsed.success) {
    return toAuthErrorState(parsed.error.flatten().fieldErrors);
  }

  if (!getRuntimeMode().isAuthReady) {
    return {
      status: "error",
      message: "Auth real indisponível neste ambiente."
    };
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
      message:
        "Não foi possível concluir o cadastro. Revise os dados e tente novamente."
    };
  }

  redirect(validateReturnTo(parsed.data.returnTo || "/minha-conta"));
}

async function signInWithEmail(input: {
  email: string;
  password: string;
  requestHeaders: Headers;
}) {
  return auth.api.signInEmail({
    body: {
      email: input.email,
      password: input.password
    },
    headers: input.requestHeaders
  });
}

async function recoverLegacyAdminCredential(input: {
  email: string;
  password: string;
}) {
  if (!db || !isMasterAdminEmail(input.email)) return false;

  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      passwordHash: users.passwordHash
    })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user || user.role !== "admin" || !user.passwordHash) return false;

  const [credential] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, user.id),
        eq(accounts.providerId, "credential")
      )
    )
    .limit(1);

  if (credential) return false;

  const validLegacyPassword = await verifyPassword({
    hash: user.passwordHash,
    password: input.password
  }).catch(() => false);

  if (!validLegacyPassword) return false;

  await db.insert(accounts).values({
    issuer: "local:credential",
    accountId: user.id,
    providerId: "credential",
    userId: user.id,
    password: await hashPassword(input.password)
  });

  return true;
}

function isMasterAdminEmail(email: string) {
  return env.ADMIN_MASTER_EMAILS.split(/[;,\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

function describeLoginError(error: unknown) {
  const code = readErrorText(error, "code");
  const message = readErrorText(error, "message");
  const combined = `${code} ${message}`.toUpperCase();

  if (
    combined.includes("INVALID_EMAIL_OR_PASSWORD") ||
    combined.includes("INVALID CREDENTIALS") ||
    combined.includes("USER_NOT_FOUND")
  ) {
    return "E-mail ou senha incorretos.";
  }

  return "Não foi possível acessar sua conta agora. Tente novamente em instantes.";
}

function readErrorText(error: unknown, field: "code" | "message") {
  if (typeof error !== "object" || error === null || !(field in error)) return "";
  return String((error as Record<string, unknown>)[field] ?? "");
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

export async function finalizeTwoFactorLoginAction() {
  const session = await getCurrentSession();
  if (session.status !== "authenticated") return { status: "unauthenticated" as const };
  const guestToken = await getGuestCartTokenForMerge();
  if (guestToken) {
    await mergeGuestCartIntoUser({ userId: session.userId, guestToken });
    await expireGuestCartToken();
  }
  return { status: "success" as const };
}

function toAuthErrorState(
  fieldErrors: Record<string, string[] | undefined>
): AuthActionState {
  return {
    status: "error",
    message: "Revise os campos destacados antes de continuar.",
    fields: Object.fromEntries(
      Object.entries(fieldErrors)
        .filter(([, messages]) => messages !== undefined && messages.length > 0)
        .map(([field, messages]) => [field, messages?.[0] ?? "Campo inválido."])
    )
  };
}
