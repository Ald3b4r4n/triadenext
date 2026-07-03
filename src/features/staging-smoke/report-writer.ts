import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { sanitizeForStagingSmokeReport } from "./safety";
import type { StagingSmokeChecklist, StagingSmokeSummary } from "./report-types";
import type { StagingSmokeReport, StagingSmokeRunResult } from "./types";

export const STAGING_SMOKE_OUTPUT_ROOT = "data/dry-run/output";

export function createStagingSmokeReport(result: StagingSmokeRunResult): StagingSmokeReport {
  return {
    schemaVersion: 1,
    runId: `staging-smoke-${Date.now()}`,
    startedAt: result.generatedAt,
    feature: "025-fase-17-staging-smoke",
    targetKind: result.preflight.target?.kind ?? "unknown",
    overallStatus: result.status,
    goNoGo: result.goNoGo,
    checks: result.checks,
    issues: result.issues,
    humanApprovalRequired: result.humanApprovalRequired,
    secretsPrinted: false,
    safety: result.safety
  };
}

export function summarizeStagingSmoke(report: StagingSmokeReport): StagingSmokeSummary {
  return {
    status: report.overallStatus,
    goNoGo: report.goNoGo,
    checks: report.checks.length,
    blockers: report.issues.filter((issue) => issue.blocksGoLive).length,
    pendingConfig: report.checks.filter((check) => check.status === "pending-config").length,
    pendingInput: report.checks.filter((check) => check.status === "pending-input").length,
    failed: report.checks.filter((check) => check.status === "failed").length
  };
}

export function createGoLiveChecklist(report: StagingSmokeReport): StagingSmokeChecklist {
  const summary = summarizeStagingSmoke(report);
  const status =
    report.goNoGo === "go"
      ? "pending-human"
      : report.goNoGo === "pending-config"
        ? "pending-config"
        : report.goNoGo === "pending-input"
          ? "pending-input"
          : "no-go";

  return {
    schemaVersion: 1,
    feature: "025-fase-17-staging-smoke",
    status,
    requiredBeforeGoLive: [
      "Aprovacao humana explicita para qualquer avanco real.",
      "STAGING_SMOKE_URL configurada para ambiente nao produtivo.",
      "Neon staging/dev validado sem imprimir DATABASE_URL.",
      "Stripe test mode e webhook test validados sem live mode.",
      "Smoke storefront, checkout, admin e outbox sem bloqueadores.",
      "Snapshot/rollback documentado antes de qualquer migration futura.",
      `Resumo atual: ${summary.blockers} bloqueadores, ${summary.pendingConfig} pending-config, ${summary.pendingInput} pending-input.`
    ],
    abortCriteria: [
      "Qualquer sinal de producao no alvo ou runtime.",
      "Stripe live mode detectado.",
      "DATABASE_URL, token, chave Stripe ou secret aparecendo em saida operacional.",
      "Migration ou deploy tentando rodar durante a Fase 17.",
      "Falha funcional em checkout, pedido, pagamento teste, admin ou notificacoes/outbox."
    ]
  };
}

export function writeStagingSmokeReports(
  result: StagingSmokeRunResult,
  options: { cwd?: string; outputDir?: string } = {}
) {
  const report = createStagingSmokeReport(result);
  const checklist = createGoLiveChecklist(report);
  const dir = ensureStagingSmokeReportDir(options.cwd ?? process.cwd(), report.overallStatus, options.outputDir);
  const files = [
    [join(dir, "staging-smoke-report.json"), JSON.stringify(sanitizeForStagingSmokeReport(report), null, 2)],
    [join(dir, "staging-smoke-report.md"), renderStagingSmokeMarkdown(report)],
    [join(dir, "go-live-checklist.md"), renderGoLiveChecklistMarkdown(checklist)]
  ] as const;

  for (const [file, content] of files) {
    writeFileSync(file, `${content}\n`, "utf8");
  }

  return files.map(([file]) => file);
}

export function ensureStagingSmokeReportDir(cwd: string, status: string, outputDir = STAGING_SMOKE_OUTPUT_ROOT) {
  const root = resolveStagingSmokeOutputRoot(cwd, outputDir);
  const dir = join(root, `staging-smoke-${sanitizeSegment(status)}`);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return dir;
}

function resolveStagingSmokeOutputRoot(cwd: string, outputDir: string) {
  const resolved = isAbsolute(outputDir) ? resolve(outputDir) : resolve(cwd, outputDir);
  const allowedRoot = resolve(cwd, STAGING_SMOKE_OUTPUT_ROOT);
  const rel = relative(allowedRoot, resolved);

  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error("Relatorios staging smoke precisam ficar dentro de data/dry-run/output/.");
  }

  return resolved;
}

function renderStagingSmokeMarkdown(report: StagingSmokeReport) {
  const summary = summarizeStagingSmoke(report);
  return [
    "# Staging Smoke Report",
    "",
    `Status: ${report.overallStatus}`,
    `Go/no-go: ${report.goNoGo}`,
    `Target: ${report.targetKind}`,
    `Checks: ${summary.checks}`,
    `Bloqueadores: ${summary.blockers}`,
    `Pending-config: ${summary.pendingConfig}`,
    `Pending-input: ${summary.pendingInput}`,
    "",
    "| Check | Status | Resumo |",
    "| --- | --- | --- |",
    ...report.checks.map((check) => `| ${check.label} | ${check.status} | ${check.summary} |`),
    "",
    "Nenhum valor de secret, DATABASE_URL, token ou credencial e impresso neste relatorio."
  ].join("\n");
}

function renderGoLiveChecklistMarkdown(checklist: StagingSmokeChecklist) {
  return [
    "# Go-live Readiness Checklist",
    "",
    `Status sugerido: ${checklist.status}`,
    "",
    "## Obrigatorio antes de go-live",
    "",
    ...checklist.requiredBeforeGoLive.map((item) => `- [ ] ${item}`),
    "",
    "## Criterios de abortar",
    "",
    ...checklist.abortCriteria.map((item) => `- [ ] ${item}`)
  ].join("\n");
}

function sanitizeSegment(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "default"
  );
}
