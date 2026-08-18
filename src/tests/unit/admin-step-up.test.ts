import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import {
  validateAdminReturnTo,
  verifyAdminStepUpToken
} from "@/features/auth/server/admin-step-up";

function createToken(userId: string, expiresAt: number) {
  const payload = `${userId}.${expiresAt}`;
  const signature = createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

describe("admin step-up", () => {
  it("accepts a valid token bound to the admin", () => {
    const now = Date.UTC(2026, 7, 18, 12, 0, 0);
    const expiresAt = Math.floor(now / 1000) + 60;
    expect(verifyAdminStepUpToken(createToken("admin-1", expiresAt), "admin-1", now)).toBe(true);
  });

  it("rejects expired, altered and cross-user tokens", () => {
    const now = Date.UTC(2026, 7, 18, 12, 0, 0);
    const expiresAt = Math.floor(now / 1000) + 60;
    const token = createToken("admin-1", expiresAt);

    expect(verifyAdminStepUpToken(token, "admin-2", now)).toBe(false);
    expect(verifyAdminStepUpToken(`${token}alterado`, "admin-1", now)).toBe(false);
    expect(verifyAdminStepUpToken(createToken("admin-1", expiresAt - 61), "admin-1", now)).toBe(false);
  });

  it("allows only internal admin return paths", () => {
    expect(validateAdminReturnTo("/admin/pedidos?status=pago")).toBe("/admin/pedidos?status=pago");
    expect(validateAdminReturnTo("https://example.com/admin")).toBe("/admin");
    expect(validateAdminReturnTo("//example.com/admin")).toBe("/admin");
    expect(validateAdminReturnTo("/minha-conta")).toBe("/admin");
  });
});
