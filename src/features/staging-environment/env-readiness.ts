import { hasEnvValue } from "./config";
import { createEnvironmentCheck, pendingConfigIssue } from "./readiness";
import type { StagingEnvironmentEnv } from "./types";

export const STAGING_ENV_MATRIX = {
  common: ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SITE_NAME"],
  database: ["STAGING_DATABASE_URL"],
  auth: ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "ADMIN_MASTER_EMAILS"],
  stripe: [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  ],
  smoke: ["STAGING_SMOKE_URL", "STAGING_TARGET"]
} as const;

export function inspectStagingEnvironmentVariables(
  env: StagingEnvironmentEnv = process.env
) {
  const names = Object.values(STAGING_ENV_MATRIX).flat();
  const presence = names.map((name) => ({
    name,
    status: hasEnvValue(env, name) ? ("present" as const) : ("missing" as const)
  }));
  const missing = presence.filter((item) => item.status === "missing");
  const issues = missing.map((item) =>
    pendingConfigIssue({
      code: `ENV_${item.name}_PENDING`,
      category: "environment",
      message: `${item.name} ainda não está configurada para staging.`
    })
  );

  return {
    presence,
    issues,
    check: createEnvironmentCheck({
      id: "staging-envs",
      provider: "environment",
      label: "Variáveis staging",
      status: missing.length > 0 ? "pending-config" : "passed",
      summary:
        missing.length > 0
          ? `${missing.length} variável(is) obrigatória(s) ausente(s); valores não foram lidos no relatório.`
          : "Variáveis staging obrigatórias presentes; valores não foram impressos.",
      issues,
      nextActions: missing.map((item) => `Configurar ${item.name} fora do Git.`)
    })
  };
}
