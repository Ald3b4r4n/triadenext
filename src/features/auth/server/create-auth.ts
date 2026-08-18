import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

type CreateAuthOptions = {
  useNextCookies?: boolean;
};

export function createAuth(options: CreateAuthOptions = {}) {
  const authSecret = env.BETTER_AUTH_SECRET || "dev-build-only-auth-secret-not-for-real-sessions";
  const baseURL = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const useNextCookies = options.useNextCookies ?? true;

  return betterAuth({
    ...(db
      ? {
          database: drizzleAdapter(db, {
            provider: "pg",
            schema: {
              ...schema,
              user: schema.users,
              session: schema.sessions,
              account: schema.accounts,
              verification: schema.verifications,
              twoFactors: schema.twoFactors
            }
          })
        }
      : {}),
    baseURL,
    trustedOrigins: resolveAuthTrustedOrigins(),
    secret: authSecret,
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 3600, max: 5 },
        "/two-factor/verify-totp": { window: 60, max: 5 },
        "/two-factor/verify-backup-code": { window: 60, max: 5 }
      }
    },
    advanced: {
      database: {
        generateId: "uuid"
      }
    },
    emailAndPassword: {
      enabled: true
    },
    user: {
      modelName: "users",
      additionalFields: {
        role: {
          type: ["customer", "admin", "manager"],
          defaultValue: "customer",
          input: false
        }
      }
    },
    session: {
      modelName: "sessions",
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24
    },
    account: {
      modelName: "accounts"
    },
    verification: {
      modelName: "verifications"
    },
    plugins: [
      twoFactor({
        issuer: "Tríade Essenza Parfum",
        twoFactorTable: "twoFactors",
        skipVerificationOnEnable: false,
        twoFactorCookieMaxAge: 600,
        trustDeviceMaxAge: 0
      }),
      ...(useNextCookies ? [nextCookies()] : [])
    ]
  });
}

export function resolveAuthTrustedOrigins(
  runtimeEnv: Record<string, string | undefined> = process.env
) {
  const candidates = [
    runtimeEnv.BETTER_AUTH_URL,
    runtimeEnv.NEXT_PUBLIC_APP_URL,
    runtimeEnv.STAGING_SMOKE_URL,
    ...splitOrigins(runtimeEnv.BETTER_AUTH_TRUSTED_ORIGINS),
    toHttpsUrl(runtimeEnv.VERCEL_BRANCH_URL),
    toHttpsUrl(runtimeEnv.VERCEL_URL),
    ...(runtimeEnv.STAGING_TARGET?.trim().toLowerCase() === "staging"
      ? ["https://triade-essenza-staging.vercel.app"]
      : [])
  ];

  return Array.from(
    new Set(
      candidates
        .map(toOrigin)
        .filter((origin): origin is string => Boolean(origin))
    )
  );
}

function splitOrigins(value: string | undefined) {
  return value?.split(/[;,\n]/).map((origin) => origin.trim()).filter(Boolean) ?? [];
}

function toHttpsUrl(value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized) return "";
  return normalized.includes("://") ? normalized : `https://${normalized}`;
}

function toOrigin(value: string | undefined) {
  if (!value) return "";

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : "";
  } catch {
    return "";
  }
}
