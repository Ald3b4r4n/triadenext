import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const ADMIN_STEP_UP_COOKIE = "triade_admin_step_up";
export const ADMIN_STEP_UP_MAX_AGE_SECONDS = 15 * 60;

export async function grantAdminStepUp(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_STEP_UP_MAX_AGE_SECONDS;
  const payload = `${userId}.${expiresAt}`;
  const token = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_STEP_UP_COOKIE, token, {
    httpOnly: true,
    maxAge: ADMIN_STEP_UP_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function revokeAdminStepUp() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_STEP_UP_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function hasValidAdminStepUp(userId: string) {
  const token = (await cookies()).get(ADMIN_STEP_UP_COOKIE)?.value;
  return verifyAdminStepUpToken(token, userId);
}

export function verifyAdminStepUpToken(token: string | undefined, userId: string, now = Date.now()) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [tokenUserId, rawExpiresAt, signature] = parts;
  const expiresAt = Number(rawExpiresAt);
  if (tokenUserId !== userId || !Number.isSafeInteger(expiresAt)) return false;
  if (expiresAt <= Math.floor(now / 1000)) return false;

  const payload = `${tokenUserId}.${rawExpiresAt}`;
  const expected = sign(payload);
  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function validateAdminReturnTo(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/admin")) return "/admin";
  if (value.startsWith("//") || value.includes("\\")) return "/admin";
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", env.BETTER_AUTH_SECRET).update(payload).digest("base64url");
}
