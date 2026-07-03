import type { StagingImportCliOptions, StagingImportIssue, StagingPreflightResult } from "./types";

export function validateResetRequest(preflight: StagingPreflightResult, options: Pick<StagingImportCliOptions, "allowReset" | "backupConfirmed" | "humanApprovalRef">) {
  const issues: StagingImportIssue[] = [];

  if (preflight.mode !== "reset-and-upsert") {
    return { allowed: true, issues };
  }

  if (!options.allowReset) {
    issues.push(resetIssue("RESET_BLOCKED", "Reset exige flag explicita --allow-reset."));
  }

  if (!options.backupConfirmed) {
    issues.push(resetIssue("BACKUP_REQUIRED", "Reset exige snapshot/backup confirmado."));
  }

  if (!options.humanApprovalRef?.trim()) {
    issues.push(resetIssue("APPROVAL_REQUIRED", "Reset exige aprovacao humana explicita."));
  }

  if (!preflight.environment || preflight.productionBlocked) {
    issues.push(resetIssue("PRODUCTION_BLOCKED", "Reset bloqueado sem ambiente nao produtivo confirmado."));
  }

  return {
    allowed: issues.length === 0,
    issues
  };
}

function resetIssue(code: string, message: string): StagingImportIssue {
  return {
    code,
    severity: "CRITICAL",
    origin: "humana",
    entity: "database",
    message,
    recommendedAction: "nova-fase",
    blocksImport: true
  };
}
