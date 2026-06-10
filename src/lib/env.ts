import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional().default(""),
  BETTER_AUTH_SECRET: z.string().optional().default(""),
  BETTER_AUTH_URL: z.string().url().optional().or(z.literal("")).default(""),
  DEV_ADMIN_EMAIL: z.string().email().optional().or(z.literal("")).default(""),
  DEV_ADMIN_PASSWORD: z.string().optional().default(""),
  BLOB_READ_WRITE_TOKEN: z.string().optional().default(""),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().or(z.literal("")).default(""),
  NEXT_PUBLIC_SITE_NAME: z.string().optional().default("Triade Essenza Parfum"),
  RESEND_API_KEY: z.string().optional().default(""),
  SENTRY_DSN: z.string().optional().default("")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  DEV_ADMIN_EMAIL: process.env.DEV_ADMIN_EMAIL,
  DEV_ADMIN_PASSWORD: process.env.DEV_ADMIN_PASSWORD,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN
});

export const sensitiveRuntimeEnv = {
  hasDatabaseUrl: env.DATABASE_URL.length > 0,
  hasBetterAuthSecret: env.BETTER_AUTH_SECRET.length > 0,
  hasBetterAuthUrl: env.BETTER_AUTH_URL.length > 0,
  hasDevAdminEmail: env.DEV_ADMIN_EMAIL.length > 0,
  hasDevAdminPassword: env.DEV_ADMIN_PASSWORD.length > 0,
  hasBlobToken: env.BLOB_READ_WRITE_TOKEN.length > 0,
  hasStripeSecret: env.STRIPE_SECRET_KEY.length > 0,
  hasStripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET.length > 0,
  hasStripePublishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length > 0
};
