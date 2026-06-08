import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getCurrentSession } from "@/features/auth/server/session";
import { getRuntimeMode } from "@/lib/runtime-mode";
import type { CartActor } from "../types";

export const guestCartCookieName = "guestCartToken";
export const guestCartMaxAgeSeconds = 60 * 60 * 24 * 30;

export async function resolveCartActor(
  options: { createGuestToken?: boolean } = {}
): Promise<CartActor> {
  const mode = getRuntimeMode();
  const cookieStore = await cookies();
  let guestToken = readGuestCartTokenValue(cookieStore.get(guestCartCookieName)?.value);
  const session = await getCurrentSession();

  if (!mode.hasDatabase && (mode.appEnvironment === "preview" || mode.appEnvironment === "production")) {
    return { kind: "unavailable", reason: "unsafe_environment" };
  }

  if (options.createGuestToken && guestToken === null && session.status !== "authenticated") {
    guestToken = createGuestCartToken();
    cookieStore.set(guestCartCookieName, guestToken, guestCartCookieOptions(mode.appEnvironment));
  }

  if (session.status === "authenticated") {
    return {
      kind: "authenticated",
      userId: session.userId,
      role: session.role,
      guestToken: guestToken ?? undefined
    };
  }

  if (guestToken !== null) {
    return { kind: "guest", guestToken };
  }

  if (!mode.hasDatabase && (mode.appEnvironment === "development" || mode.appEnvironment === "test")) {
    return { kind: "guest", guestToken: "dev-fallback-guest" };
  }

  return { kind: "guest", guestToken: "empty-guest" };
}

export async function getGuestCartTokenForMerge() {
  const cookieStore = await cookies();
  return readGuestCartTokenValue(cookieStore.get(guestCartCookieName)?.value);
}

export async function expireGuestCartToken() {
  const cookieStore = await cookies();
  cookieStore.delete(guestCartCookieName);
}

export function createGuestCartToken() {
  return randomBytes(32).toString("base64url");
}

export function readGuestCartTokenValue(value: string | undefined) {
  if (!value || value.length < 16 || value.length > 128 || !/^[A-Za-z0-9_-]+$/.test(value)) {
    return null;
  }

  return value;
}

function guestCartCookieOptions(environment: ReturnType<typeof getRuntimeMode>["appEnvironment"]) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: environment === "production" || environment === "preview",
    maxAge: guestCartMaxAgeSeconds,
    path: "/"
  };
}
