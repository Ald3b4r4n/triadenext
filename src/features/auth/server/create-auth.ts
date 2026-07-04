import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
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
              verification: schema.verifications
            }
          })
        }
      : {}),
    baseURL,
    secret: authSecret,
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
      modelName: "sessions"
    },
    account: {
      modelName: "accounts"
    },
    verification: {
      modelName: "verifications"
    },
    plugins: useNextCookies ? [nextCookies()] : []
  });
}
