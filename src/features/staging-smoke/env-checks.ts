import { createCheck, pendingConfigIssue } from "./result";
import type { StagingSmokeEnv, StagingSmokeIssue } from "./types";

const envSpecs = [
  {
    name: "STAGING_SMOKE_URL",
    aliases: ["STAGING_PREVIEW_URL", "PREVIEW_SMOKE_URL"],
    category: "environment" as const,
    requiredFor: "smoke real"
  },
  {
    name: "STAGING_DATABASE_URL",
    aliases: [],
    category: "database" as const,
    requiredFor: "readiness Neon/import staging"
  },
  {
    name: "STRIPE_SECRET_KEY",
    aliases: [],
    category: "stripe" as const,
    requiredFor: "pagamento teste"
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    aliases: [],
    category: "stripe" as const,
    requiredFor: "checkout teste"
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    aliases: [],
    category: "webhook" as const,
    requiredFor: "confirmação webhook teste"
  }
];

export interface SafeEnvSummary {
  name: string;
  present: boolean;
  aliasesChecked: string[];
  requiredFor: string;
}

export function inspectSafeStagingEnv(env: StagingSmokeEnv = process.env) {
  const summaries: SafeEnvSummary[] = envSpecs.map((spec) => {
    const names = [spec.name, ...spec.aliases];
    return {
      name: spec.name,
      present: names.some((name) => Boolean(env[name]?.trim())),
      aliasesChecked: spec.aliases,
      requiredFor: spec.requiredFor
    };
  });

  const issues: StagingSmokeIssue[] = summaries
    .filter((summary) => !summary.present)
    .map((summary) =>
      pendingConfigIssue({
        code: `${summary.name}_PENDING`,
        category: summary.name.includes("STRIPE")
          ? summary.name.includes("WEBHOOK")
            ? "webhook"
            : "stripe"
          : summary.name.includes("DATABASE")
            ? "database"
            : "environment",
        message: `${summary.name} ausente para ${summary.requiredFor}; somente presenca/ausencia foi avaliada.`
      })
    );

  return {
    summaries,
    issues,
    check: createCheck({
      id: "env-safe",
      label: "Validação segura de envs",
      category: "environment",
      status: issues.length > 0 ? "pending-config" : "passed",
      summary:
        issues.length > 0
          ? "Uma ou mais variaveis de staging estao ausentes; nenhum valor foi impresso."
          : "Variaveis staging necessarias estao presentes; nenhum valor foi impresso.",
      issues
    })
  };
}
