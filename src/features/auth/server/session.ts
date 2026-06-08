import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";
import { getRuntimeMode } from "@/lib/runtime-mode";

export type AuthRole = "customer" | "admin" | "manager";

export type AppSession =
  | {
      status: "authenticated";
      userId: string;
      email: string;
      role: AuthRole;
    }
  | {
      status: "unauthenticated";
      reason: "missing" | "expired" | "invalid" | "timeout" | "unavailable";
    };

export async function getCurrentSession(): Promise<AppSession> {
  const mode = getRuntimeMode();

  if (!mode.isAuthReady) {
    return { status: "unauthenticated", reason: "unavailable" };
  }

  try {
    const session = await withTimeout(
      auth.api.getSession({
        headers: await headers()
      }),
      5000
    );

    if (!session?.user) {
      return { status: "unauthenticated", reason: "missing" };
    }

    const role = normalizeRole((session.user as { role?: unknown }).role);

    if (!role) {
      return { status: "unauthenticated", reason: "invalid" };
    }

    return {
      status: "authenticated",
      userId: session.user.id,
      email: session.user.email,
      role
    };
  } catch (error) {
    if (error instanceof AuthTimeoutError) {
      return { status: "unauthenticated", reason: "timeout" };
    }

    return { status: "unauthenticated", reason: "invalid" };
  }
}

export function normalizeRole(value: unknown): AuthRole | null {
  return value === "customer" || value === "admin" || value === "manager" ? value : null;
}

export function validateReturnTo(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (value.startsWith("/api/auth")) {
    return "/";
  }

  return value;
}

class AuthTimeoutError extends Error {}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new AuthTimeoutError("Auth timeout")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
