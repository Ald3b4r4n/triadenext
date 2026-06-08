import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

const authSecret = env.BETTER_AUTH_SECRET || "dev-build-only-auth-secret-not-for-real-sessions";
const baseURL = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const auth = betterAuth({
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
  plugins: [nextCookies()]
});

export type BetterAuthSession = typeof auth.$Infer.Session;
