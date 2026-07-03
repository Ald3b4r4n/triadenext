import type { EntityUpsertResult, StagingImportDivergence, StagingImportIssue } from "./types";

export function issuesToStagingDivergences(issues: StagingImportIssue[]): StagingImportDivergence[] {
  return issues.map((issue, index) => ({
    id: `STG-DIV-${String(index + 1).padStart(3, "0")}`,
    code: issue.code,
    origin: issue.origin,
    severity: issue.severity,
    entity: issue.entity ?? "environment",
    message: issue.message,
    recommendedAction: issue.recommendedAction,
    blocksNextPhase: issue.blocksImport
  }));
}

export function upsertResultsToDivergences(results: EntityUpsertResult[]): StagingImportDivergence[] {
  return results
    .filter((result) => result.status === "conflict")
    .map((result, index) => ({
      id: `STG-DIV-${String(index + 1).padStart(3, "0")}`,
      code: "UPSERT_CONFLICT",
      origin: "mapeamento",
      severity: "HIGH",
      entity: result.entity,
      message: result.message,
      recommendedAction: "corrigir-mapeamento",
      blocksNextPhase: true
    }));
}
