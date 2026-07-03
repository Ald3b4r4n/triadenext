import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { issuesToStagingDivergences } from "./divergences";
import { ensureStagingReportDir, sanitizeReportObject } from "./report-output";
import type { HumanApprovalSummary, PostImportReport, PreImportReport } from "./report-types";
import type { StagingImportExecutionResult, StagingPreflightResult } from "./types";

export function createPreImportReport(preflight: StagingPreflightResult): PreImportReport {
  const blockers = issuesToStagingDivergences(preflight.issues.filter((issue) => issue.blocksImport));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    feature: "024-fase-16-staging-import",
    target: {
      kind: preflight.environment?.target ?? null,
      provider: preflight.environment?.provider ?? null,
      productionBlocked: preflight.productionBlocked,
      approvedByHuman: preflight.approval.provided
    },
    source: {
      inputDir: preflight.input?.pathLabel ?? null,
      dryRunStatus: preflight.dryRun?.status ?? null,
      criticalBlockers: preflight.dryRun?.criticalBlockers ?? null
    },
    safety: {
      secretsPrinted: false,
      databaseUrlPrinted: false,
      legacyTouched: false,
      productionConnectionAttempted: false
    },
    writePlan: {
      mode: preflight.mode,
      backupConfirmed: preflight.backup.confirmed,
      resetRequested: preflight.mode === "reset-and-upsert",
      humanApprovalRef: preflight.approval.reference ? "sanitized-reference" : null
    },
    result: {
      status: preflight.status,
      blockers
    }
  };
}

export function createPostImportReport(execution: StagingImportExecutionResult): PostImportReport {
  const blockers = execution.divergences.filter((divergence) => divergence.blocksNextPhase).length;
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    feature: "024-fase-16-staging-import",
    target: {
      kind: execution.preflight.environment?.target ?? null,
      provider: execution.preflight.environment?.provider ?? null
    },
    summary: {
      status: execution.status,
      mode: execution.mode,
      entitiesWritten: execution.counts.reduce((sum, count) => sum + count.inserted + count.updated, 0),
      blockers,
      warnings: execution.divergences.length - blockers
    },
    counts: execution.counts,
    divergences: execution.divergences,
    safety: execution.safety
  };
}

export function createHumanApprovalSummary(execution: StagingImportExecutionResult): HumanApprovalSummary {
  const blockers = execution.divergences.filter((divergence) => divergence.blocksNextPhase).length;
  const status =
    execution.status === "imported" && blockers === 0
      ? "pending-human"
      : execution.status === "rollback-required"
        ? "rollback"
        : "no-go";

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    feature: "024-fase-16-staging-import",
    status,
    target: execution.preflight.environment?.target ?? null,
    preflightStatus: execution.preflight.status,
    importStatus: execution.status,
    backupConfirmed: execution.preflight.backup.confirmed,
    rollbackDocumented: true,
    divergences: {
      blockers,
      warnings: execution.divergences.length - blockers
    }
  };
}

export function writePreImportReport(preflight: StagingPreflightResult, options: { cwd?: string; outputDir?: string } = {}) {
  const report = createPreImportReport(preflight);
  const dir = ensureStagingReportDir(options.cwd ?? process.cwd(), report.result.status, options.outputDir);
  const jsonPath = join(dir, "pre-import-report.json");
  const markdownPath = join(dir, "pre-import-report.md");

  writeFileSync(jsonPath, `${JSON.stringify(sanitizeReportObject(report), null, 2)}\n`, "utf8");
  writeFileSync(markdownPath, renderPreImportMarkdown(report), "utf8");
  return [jsonPath, markdownPath];
}

export function writePostImportReports(execution: StagingImportExecutionResult, options: { cwd?: string; outputDir?: string } = {}) {
  const post = createPostImportReport(execution);
  const approval = createHumanApprovalSummary(execution);
  const dir = ensureStagingReportDir(options.cwd ?? process.cwd(), execution.status, options.outputDir);
  const files = [
    [join(dir, "post-import-report.json"), JSON.stringify(sanitizeReportObject(post), null, 2)],
    [join(dir, "post-import-report.md"), renderPostImportMarkdown(post)],
    [join(dir, "divergence-report.json"), JSON.stringify(sanitizeReportObject(post.divergences), null, 2)],
    [join(dir, "human-approval-summary.md"), renderHumanApprovalMarkdown(approval)],
    [join(dir, "rollback-report.md"), renderRollbackMarkdown(execution)]
  ] as const;

  for (const [file, content] of files) {
    writeFileSync(file, `${content}\n`, "utf8");
  }

  return files.map(([file]) => file);
}

function renderPreImportMarkdown(report: PreImportReport) {
  return [
    "# Pre-import Report",
    "",
    `Status: ${report.result.status}`,
    `Target: ${report.target.kind ?? "n/a"}`,
    `Provider: ${report.target.provider ?? "n/a"}`,
    `Input: ${report.source.inputDir ?? "n/a"}`,
    `Dry-run: ${report.source.dryRunStatus ?? "n/a"}`,
    `Modo: ${report.writePlan.mode}`,
    `Backup confirmado: ${report.writePlan.backupConfirmed ? "sim" : "nao"}`,
    `Producao bloqueada: ${report.target.productionBlocked ? "sim" : "nao"}`,
    "",
    "Valores sensiveis nao sao impressos neste relatorio."
  ].join("\n");
}

function renderPostImportMarkdown(report: PostImportReport) {
  return [
    "# Post-import Report",
    "",
    `Status: ${report.summary.status}`,
    `Modo: ${report.summary.mode}`,
    `Entidades escritas: ${report.summary.entitiesWritten}`,
    `Bloqueadores: ${report.summary.blockers}`,
    `Avisos: ${report.summary.warnings}`,
    "",
    "| Entidade | Input | Antes | Depois | Inseridos | Atualizados | Ignorados |",
    "|----------|-------|-------|--------|-----------|-------------|----------|",
    ...report.counts.map(
      (count) =>
        `| ${count.entity} | ${count.input} | ${count.before} | ${count.after} | ${count.inserted} | ${count.updated} | ${count.skipped} |`
    )
  ].join("\n");
}

function renderHumanApprovalMarkdown(summary: HumanApprovalSummary) {
  return [
    "# Human Approval Summary",
    "",
    `Status sugerido: ${summary.status}`,
    `Target: ${summary.target ?? "n/a"}`,
    `Preflight: ${summary.preflightStatus}`,
    `Importacao: ${summary.importStatus}`,
    `Backup confirmado: ${summary.backupConfirmed ? "sim" : "nao"}`,
    `Rollback documentado: ${summary.rollbackDocumented ? "sim" : "nao"}`,
    `Bloqueadores: ${summary.divergences.blockers}`,
    `Avisos: ${summary.divergences.warnings}`,
    "",
    "- [ ] Aprovado",
    "- [ ] Aprovado com excecoes",
    "- [ ] No-go",
    "- [ ] Rollback"
  ].join("\n");
}

function renderRollbackMarkdown(execution: StagingImportExecutionResult) {
  return [
    "# Rollback Report",
    "",
    `Status da importacao: ${execution.status}`,
    `Target: ${execution.preflight.environment?.target ?? "n/a"}`,
    "Rollback deve usar snapshot/backup declarado antes da importacao.",
    "Nenhuma acao de producao, deploy, migration ou Laravel legado faz parte deste relatorio."
  ].join("\n");
}
