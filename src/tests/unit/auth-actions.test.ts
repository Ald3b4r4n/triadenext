import { describe, expect, it, vi } from "vitest";

const { signInEmail, signUpEmail, signOut } = vi.hoisted(() => ({
  signInEmail: vi.fn(async () => ({ ok: true })),
  signUpEmail: vi.fn(async () => ({ ok: true })),
  signOut: vi.fn(async () => ({ ok: true }))
}));

vi.mock("@/lib/runtime-mode", () => ({
  getRuntimeMode: vi.fn(() => ({
    hasDatabase: true,
    hasBlobToken: false,
    hasAuthSecret: true,
    isAuthReady: true,
    appEnvironment: "development",
    canMutateRealData: true,
    isFallbackMode: false,
    databaseNotice: null,
    adminAuthNotice: null
  }))
}));

vi.mock("@/features/auth/server/auth", () => ({
  auth: {
    api: {
      signInEmail,
      signUpEmail,
      signOut
    }
  }
}));

import { loginAction, logoutAction, signupAction } from "@/features/auth/server/actions";

describe("auth actions", () => {
  it("rejects invalid login payloads", async () => {
    const result = await loginAction(
      { status: "idle", message: "" },
      new FormData()
    );

    expect(result.status).toBe("error");
  });

  it("rejects invalid signup payloads", async () => {
    const result = await signupAction(
      { status: "idle", message: "" },
      new FormData()
    );

    expect(result.status).toBe("error");
  });

  it("invalidates session on logout", async () => {
    await expect(logoutAction()).rejects.toThrow(/NEXT_REDIRECT/);
  });
});
