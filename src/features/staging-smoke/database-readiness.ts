import { createCheck, pendingConfigIssue } from "./result";
import type { StagingSmokeEnv, StagingSmokeIssue } from "./types";

export function checkStagingDatabaseReadiness(input: {
  env?: StagingSmokeEnv;
  humanApprovalRef?: string | null;
}) {
  const env = input.env ?? process.env;
  const issues: StagingSmokeIssue[] = [];
  const hasDatabaseUrl = Boolean(env.STAGING_DATABASE_URL?.trim());

  if (!hasDatabaseUrl) {
    issues.push(
      pendingConfigIssue({
        code: "STAGING_DATABASE_URL_PENDING",
        category: "database",
        message: "STAGING_DATABASE_URL ausente; nenhuma conexao remota sera tentada."
      })
    );
  }

  if (!input.humanApprovalRef) {
    issues.push(
      pendingConfigIssue({
        code: "DATABASE_APPROVAL_PENDING",
        category: "database",
        message: "Aprovacao humana para validar banco staging ainda nao foi informada."
      })
    );
  }

  return {
    connectionVariablePresent: hasDatabaseUrl,
    approvedByHuman: Boolean(input.humanApprovalRef),
    issues,
    check: createCheck({
      id: "neon-staging",
      label: "Neon staging/dev readiness",
      category: "database",
      status: issues.length > 0 ? "pending-config" : "passed",
      summary:
        issues.length > 0
          ? "Banco staging/dev pendente de configuracao ou aprovacao; nenhuma conexao foi aberta."
          : "Banco staging/dev possui precondicoes declaradas; conexao real continua fora do check local.",
      issues
    })
  };
}
