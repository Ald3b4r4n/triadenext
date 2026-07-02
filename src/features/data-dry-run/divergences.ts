import type { DryRunIssue, ReconciliationDivergence } from "./types";

export function issuesToDivergences(issues: DryRunIssue[]) {
  return issues.map<ReconciliationDivergence>((issue, index) => ({
    id: `DVG-${String(index + 1).padStart(3, "0")}`,
    code: issue.code,
    domain: issue.entity ?? "seguranca",
    entityKey: issue.entityKey ?? issue.field ?? "n/a",
    severity: issue.severity,
    goLiveImpact: issue.goLiveImpact,
    message: issue.message,
    recommendedAction: issue.recommendedAction
  }));
}

export function isBlockingDivergence(divergence: Pick<ReconciliationDivergence, "severity" | "goLiveImpact">) {
  return divergence.goLiveImpact === "bloqueador" || divergence.severity === "CRITICAL" || divergence.severity === "HIGH";
}
