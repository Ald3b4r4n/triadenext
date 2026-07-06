import type {
  HumanApprovalDecision,
  StagingImportExecutionResult
} from "./types";

export function resolveHumanApprovalDecision(
  execution: StagingImportExecutionResult
): HumanApprovalDecision {
  if (
    execution.status === "rollback-required" ||
    execution.status === "rolled-back"
  ) {
    return "rollback";
  }

  if (execution.divergences.some((divergence) => divergence.blocksNextPhase)) {
    return "no-go";
  }

  if (execution.divergences.length > 0) {
    return "approved-with-exceptions";
  }

  return "approved";
}

export function buildHumanApprovalChecklist(
  execution: StagingImportExecutionResult
) {
  return {
    environment: execution.preflight.environment?.target ?? "pending",
    importStatus: execution.status,
    decision: resolveHumanApprovalDecision(execution),
    requiredChecks: [
      "ambiente não produtivo confirmado",
      "backup/snapshot confirmado",
      "rollback documentado",
      "relatórios antes/depois revisados",
      "divergencias classificadas",
      "smoke pós-importação aprovado"
    ]
  };
}
