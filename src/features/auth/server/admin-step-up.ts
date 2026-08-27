import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const ADMIN_STEP_UP_COOKIE = "triade_admin_step_up";

export async function grantAdminStepUp(userId: string, sessionId: string) {
  const token = createAdminStepUpToken(userId, sessionId);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_STEP_UP_COOKIE, token, {
    httpOnly: true,
    path: "/",
    priority: "high",
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

export async function hasValidAdminStepUp(userId: string, sessionId: string) {
  const token = (await cookies()).get(ADMIN_STEP_UP_COOKIE)?.value;
  return verifyAdminStepUpToken(token, userId, sessionId);
}

export function createAdminStepUpToken(userId: string, sessionId: string) {
  const payload = Buffer.from(
    JSON.stringify({ version: 2, userId, sessionId }),
    "utf8"
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminStepUpToken(
  token: string | undefined,
  userId: string,
  sessionId: string
) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expected = sign(payload);
  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      version?: unknown;
      userId?: unknown;
      sessionId?: unknown;
    };
    return (
      parsed.version === 2 &&
      parsed.userId === userId &&
      parsed.sessionId === sessionId
    );
  } catch {
    return false;
  }
}

export function validateAdminReturnTo(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/admin")) return "/admin";
  if (value.startsWith("//") || value.includes("\\")) return "/admin";
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", env.BETTER_AUTH_SECRET).update(payload).digest("base64url");
}
