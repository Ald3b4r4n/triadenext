import type { DivergenceOrigin, DryRunIssue, ReconciliationDivergence } from "./types";

export function issuesToDivergences(issues: DryRunIssue[]) {
  return issues.map<ReconciliationDivergence>((issue, index) => ({
    id: `DVG-${String(index + 1).padStart(3, "0")}`,
    code: issue.code,
    domain: issue.entity ?? "seguranca",
    entityKey: issue.entityKey ?? issue.field ?? "n/a",
    severity: issue.severity,
    goLiveImpact: issue.goLiveImpact,
    message: issue.message,
    recommendedAction: issue.recommendedAction,
    origin: classifyDivergenceOrigin(issue),
    nextFixable: isNextFixableIssue(issue)
  }));
}

export function isBlockingDivergence(divergence: Pick<ReconciliationDivergence, "severity" | "goLiveImpact">) {
  return divergence.goLiveImpact === "bloqueador" || divergence.severity === "CRITICAL" || divergence.severity === "HIGH";
}

export function classifyDivergenceOrigin(issue: DryRunIssue): DivergenceOrigin {
  if (issue.recommendedAction === "corrigir-mapeamento") {
    return "mapeamento";
  }

  if (issue.recommendedAction === "aceitar-excecao" || issue.recommendedAction === "nova-fase") {
    return "humana";
  }

  if (issue.code.startsWith("NEXT_")) {
    return "next";
  }

  return "dados";
}

export function isNextFixableIssue(issue: DryRunIssue) {
  const origin = classifyDivergenceOrigin(issue);
  return origin === "next" || origin === "mapeamento";
}
