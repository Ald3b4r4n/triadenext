import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminStepUpToken,
  grantAdminStepUp,
  validateAdminReturnTo,
  verifyAdminStepUpToken
} from "@/features/auth/server/admin-step-up";

const { setCookie } = vi.hoisted(() => ({
  setCookie: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: setCookie
  }))
}));

describe("admin step-up", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores the authorization as a browser-session cookie", async () => {
    await grantAdminStepUp("admin-1", "session-1");

    expect(setCookie).toHaveBeenCalledWith(
      "triade_admin_step_up",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        priority: "high",
        sameSite: "strict"
      })
    );
    const options = setCookie.mock.calls[0]?.[2];
    expect(options).not.toHaveProperty("expires");
    expect(options).not.toHaveProperty("maxAge");
  });

  it("accepts a valid token bound to the admin and current browser session", () => {
    const token = createAdminStepUpToken("admin-1", "session-1");
    expect(verifyAdminStepUpToken(token, "admin-1", "session-1")).toBe(true);
  });

  it("rejects altered, cross-user and cross-session tokens", () => {
    const token = createAdminStepUpToken("admin-1", "session-1");

    expect(verifyAdminStepUpToken(token, "admin-2", "session-1")).toBe(false);
    expect(verifyAdminStepUpToken(token, "admin-1", "session-2")).toBe(false);
    expect(verifyAdminStepUpToken(`${token}alterado`, "admin-1", "session-1")).toBe(false);
  });

  it("allows only internal admin return paths", () => {
    expect(validateAdminReturnTo("/admin/pedidos?status=pago")).toBe("/admin/pedidos?status=pago");
    expect(validateAdminReturnTo("https://example.com/admin")).toBe("/admin");
    expect(validateAdminReturnTo("//example.com/admin")).toBe("/admin");
    expect(validateAdminReturnTo("/minha-conta")).toBe("/admin");
  });
});
