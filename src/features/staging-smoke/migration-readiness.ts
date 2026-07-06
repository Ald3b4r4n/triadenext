import { createCheck, pendingConfigIssue } from "./result";
import type { StagingSmokeIssue } from "./types";

export function checkStagingMigrationReadiness(input: {
  migrationApprovalRef?: string | null;
  snapshotRef?: string | null;
}) {
  const issues: StagingSmokeIssue[] = [];

  if (!input.migrationApprovalRef) {
    issues.push(
      pendingConfigIssue({
        code: "MIGRATION_APPROVAL_PENDING",
        category: "migration",
        message:
          "Migration staging/dev exige aprovação humana explícita; nenhuma migration foi executada."
      })
    );
  }

  if (!input.snapshotRef) {
    issues.push(
      pendingConfigIssue({
        code: "SNAPSHOT_PENDING",
        category: "migration",
        message: "Snapshot/rollback staging ainda não foi declarado."
      })
    );
  }

  return {
    issues,
    check: createCheck({
      id: "migration-readiness",
      label: "Migrations staging/dev",
      category: "migration",
      status: issues.length > 0 ? "pending-config" : "passed",
      summary:
        issues.length > 0
          ? "Migrations ficam pendentes até aprovação humana e snapshot; nenhuma migration foi executada."
          : "Checklist de migration staging/dev possui aprovação e snapshot declarados; execução real segue manual.",
      issues
    })
  };
}
