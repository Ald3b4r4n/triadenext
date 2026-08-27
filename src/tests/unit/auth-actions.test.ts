import { beforeEach, describe, expect, it, vi } from "vitest";

const { revokeAdminStepUp, signInEmail, signUpEmail, signOut } = vi.hoisted(() => ({
  revokeAdminStepUp: vi.fn(async () => undefined),
  signInEmail: vi.fn(async () => ({ ok: true })),
  signUpEmail: vi.fn(async () => ({ ok: true })),
  signOut: vi.fn(async () => ({ ok: true }))
}));

vi.mock("next/headers", async (importOriginal) => {
  const original = await importOriginal<typeof import("next/headers")>();
  return {
    ...original,
    headers: vi.fn(async () => new Headers())
  };
});

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

vi.mock("@/features/auth/server/admin-step-up", () => ({
  revokeAdminStepUp
}));

import { loginAction, logoutAction, signupAction } from "@/features/auth/server/actions";

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("creates a customer when password confirmation matches", async () => {
    const formData = new FormData();
    formData.set("name", "Cliente Teste");
    formData.set("email", "cliente@example.com");
    formData.set("password", "SenhaSegura1234");
    formData.set("passwordConfirmation", "SenhaSegura1234");
    formData.set("returnTo", "/minha-conta");

    await expect(
      signupAction({ status: "idle", message: "" }, formData)
    ).rejects.toThrow(/NEXT_REDIRECT/);

    expect(signUpEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          name: "Cliente Teste",
          email: "cliente@example.com",
          password: "SenhaSegura1234"
        }
      })
    );
  });

  it("invalidates session on logout", async () => {
    await expect(logoutAction()).rejects.toThrow(/NEXT_REDIRECT/);
    expect(revokeAdminStepUp).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledOnce();
  });
});
