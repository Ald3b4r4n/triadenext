import { describe, expect, it } from "vitest";
import { resolveAuthTrustedOrigins } from "@/features/auth/server/create-auth";

describe("origens confiáveis da autenticação", () => {
  it("autoriza o domínio estável somente no staging", () => {
    expect(resolveAuthTrustedOrigins({ STAGING_TARGET: "staging" })).toContain(
      "https://triade-essenza-staging.vercel.app"
    );
    expect(resolveAuthTrustedOrigins({ STAGING_TARGET: "production" })).not.toContain(
      "https://triade-essenza-staging.vercel.app"
    );
  });

  it("normaliza URLs configuradas e domínios gerados pela Vercel", () => {
    expect(
      resolveAuthTrustedOrigins({
        BETTER_AUTH_URL: "https://auth.example.com/api/auth",
        BETTER_AUTH_TRUSTED_ORIGINS: "https://store.example.com, inválida",
        VERCEL_BRANCH_URL: "preview.example.vercel.app"
      })
    ).toEqual([
      "https://auth.example.com",
      "https://store.example.com",
      "https://preview.example.vercel.app"
    ]);
  });
});
