import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/runtime-mode", () => ({
  getRuntimeMode: vi.fn(() => ({
    hasDatabase: false,
    hasBlobToken: false,
    hasAuthSecret: false,
    isAuthReady: false,
    appEnvironment: "development",
    canMutateRealData: false,
    isFallbackMode: true,
    databaseNotice: "fallback",
    adminAuthNotice: "fallback"
  }))
}));

import { getCurrentSession, validateReturnTo } from "@/features/auth/server/session";

describe("auth session", () => {
  it("returns unavailable when auth is not ready", async () => {
    await expect(getCurrentSession()).resolves.toEqual({
      status: "unauthenticated",
      reason: "unavailable"
    });
  });

  it("keeps returnTo safe", () => {
    expect(validateReturnTo("/admin")).toBe("/admin");
    expect(validateReturnTo("https://example.com")).toBe("/");
    expect(validateReturnTo("//evil.com")).toBe("/");
  });
});
