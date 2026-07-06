import { runDataDryRun } from "@/features/data-dry-run/run-dry-run";
import type {
  ReconciliationDivergence,
  ReconciliationReport
} from "@/features/data-dry-run/types";
import type { DryRunGateResult, StagingImportIssue } from "./types";

export interface EvaluateDryRunGateOptions {
  cwd?: string;
  inputDir?: string;
  report?: ReconciliationReport;
  approvedWithoutCriticalBlockers?: boolean;
}

export function evaluateDryRunGate(
  options: EvaluateDryRunGateOptions = {}
): DryRunGateResult {
  const report =
    options.report ??
    runDataDryRun({
      cwd: options.cwd,
      inputDir: options.inputDir,
      writeReport: false
    }).report;
  const criticalBlockers = report.divergences.filter(
    (divergence) => divergence.severity === "CRITICAL"
  ).length;
  const hardBlockers = report.divergences.filter(isHardBlocker).length;
  const accepted =
    report.summary.goNoGo === "go" ||
    (options.approvedWithoutCriticalBlockers === true &&
      criticalBlockers === 0 &&
      report.summary.goNoGo !== "pending-input");

  return {
    status: report.summary.goNoGo,
    accepted,
    criticalBlockers,
    blockers: report.summary.blockers,
    warnings: report.summary.warnings,
    report,
    issues: accepted
      ? []
      : mapDryRunIssues(report, criticalBlockers, hardBlockers)
  };
}

function isHardBlocker(divergence: ReconciliationDivergence) {
  return (
    divergence.severity === "CRITICAL" ||
    divergence.goLiveImpact === "bloqueador"
  );
}

function mapDryRunIssues(
  report: ReconciliationReport,
  criticalBlockers: number,
  hardBlockers: number
): StagingImportIssue[] {
  if (report.summary.goNoGo === "pending-input") {
    return [
      {
        code: "INPUT_PENDING",
        severity: "LOW",
        origin: "humana",
        entity: "environment",
        message:
          "Arquivos aprovados pendentes; importação staging não será executada.",
        recommendedAction: "nova-fase",
        blocksImport: false
      }
    ];
  }

  return [
    {
      code: "DRY_RUN_BLOCKED",
      severity: criticalBlockers > 0 ? "CRITICAL" : "HIGH",
      origin: "dados",
      entity: "environment",
      message: `Dry-run anterior não liberou importação: ${hardBlockers} bloqueios relevantes.`,
      recommendedAction: "corrigir-origem",
      blocksImport: true
    }
  ];
}
