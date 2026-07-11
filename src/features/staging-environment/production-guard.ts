import { blockingIssue } from "./readiness";
import type {
  StagingEnvironmentConfig,
  StagingEnvironmentEnv,
  StagingEnvironmentIssue
} from "./types";

export function guardStagingEnvironment(input: {
  config: StagingEnvironmentConfig;
  env?: StagingEnvironmentEnv;
}) {
  const env = input.env ?? process.env;
  const issues: StagingEnvironmentIssue[] = [];

  if (env.VERCEL_ENV === "production" || env.NODE_ENV === "production") {
    issues.push(
      blockingIssue({
        code: "PRODUCTION_BLOCKED",
        category: "security",
        message: "Runtime de produção detectado; operação staging bloqueada."
      })
    );
  }

  if (/live/i.test(env.STAGING_STRIPE_MODE ?? "")) {
    issues.push(
      blockingIssue({
        code: "STRIPE_LIVE_BLOCKED",
        category: "security",
        message: "Stripe live mode bloqueado para a Fase 18."
      })
    );
  }

  return { allowed: issues.length === 0, issues };
}
