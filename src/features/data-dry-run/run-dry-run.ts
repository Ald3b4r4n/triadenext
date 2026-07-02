import { resolveSafeOutputDir, loadDryRunInput } from "./input-discovery";
import { normalizeDryRunDataset } from "./normalize";
import { reconcileDryRunData } from "./reconciliation";
import { writeReconciliationReport } from "./report-writer";
import type { ReconciliationReport, ReportFormat } from "./types";

export interface RunDataDryRunOptions {
  cwd?: string;
  inputDir?: string;
  outputDir?: string;
  format?: ReportFormat;
  writeReport?: boolean;
}

export interface RunDataDryRunResult {
  report: ReconciliationReport;
  files: string[];
}

export function runDataDryRun(options: RunDataDryRunOptions = {}): RunDataDryRunResult {
  const cwd = options.cwd ?? process.cwd();
  const dataset = loadDryRunInput({ cwd, inputDir: options.inputDir });
  const normalized = normalizeDryRunDataset(dataset);
  const report = reconcileDryRunData(dataset, normalized);
  const files = options.writeReport
    ? writeReconciliationReport(
        report,
        resolveSafeOutputDir(cwd, options.outputDir),
        options.format ?? "both"
      )
    : [];

  return { report, files };
}

export function formatDryRunSummary(result: RunDataDryRunResult) {
  const { report, files } = result;
  return [
    "Controlled data dry-run readiness",
    `Fonte: ${report.source.pathLabel}`,
    `Resultado: ${report.summary.goNoGo}`,
    `Bloqueadores: ${report.summary.blockers}`,
    `Avisos: ${report.summary.warnings}`,
    `Relatorios: ${files.length > 0 ? files.map((file) => file.replace(/\\/g, "/")).join(", ") : "nao escritos"}`,
    "Este script nao conecta banco, nao executa migration, nao importa dados, nao faz upload e nao faz deploy."
  ].join("\n");
}
