import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { formatMoney } from "@/lib/money";
import { ensureDryRunOutputDir } from "./input-discovery";
import { redactUnsafeValue } from "./safety";
import type { ReconciliationReport, ReportFormat } from "./types";

export function writeReconciliationReport(report: ReconciliationReport, outputDir: string, format: ReportFormat = "both") {
  const reportOutputDir = join(outputDir, outputSegmentForReport(report));
  ensureDryRunOutputDir(reportOutputDir);
  const files: string[] = [];

  if (format === "json" || format === "both") {
    const path = join(reportOutputDir, "reconciliation-report.json");
    writeFileSync(path, `${JSON.stringify(sanitizeReportForOutput(report), null, 2)}\n`, "utf8");
    files.push(path);
  }

  if (format === "markdown" || format === "both") {
    const path = join(reportOutputDir, "reconciliation-report.md");
    writeFileSync(path, renderReconciliationMarkdown(report), "utf8");
    files.push(path);

    const summaryPath = join(reportOutputDir, "reconciliation-summary.sanitized.md");
    writeFileSync(summaryPath, renderSanitizedSummaryMarkdown(report), "utf8");
    files.push(summaryPath);
  }

  return files;
}

function outputSegmentForReport(report: ReconciliationReport) {
  const sourceSegment = report.source.executionName ?? report.source.pathLabel.split("/").filter(Boolean).at(-1) ?? "default";
  const status = report.summary.goNoGo;
  return `${sanitizePathSegment(sourceSegment)}-${sanitizePathSegment(status)}`;
}

export function renderReconciliationMarkdown(report: ReconciliationReport) {
  const lines = [
    "# Reconciliation Report",
    "",
    `Gerado em: ${report.generatedAt}`,
    `Fonte: ${report.source.pathLabel}`,
    `Resultado: ${report.summary.goNoGo}`,
    "",
    "## Resumo",
    "",
    "| Métrica | Valor |",
    "|---------|-------|",
    `| Bloqueadores | ${report.summary.blockers} |`,
    `| Avisos | ${report.summary.warnings} |`,
    `| Secrets detectados | ${report.privacy.secretsDetected ? "sim" : "nao"} |`,
    `| Origem dados | ${report.summary.byOrigin.dados} |`,
    `| Origem Next | ${report.summary.byOrigin.next} |`,
    `| Origem mapeamento | ${report.summary.byOrigin.mapeamento} |`,
    `| Pendencia humana | ${report.summary.byOrigin.humana} |`,
    "",
    "## Pendencias de entrada",
    "",
    "| Entidade | Obrigatorio | Status | Arquivos aceitos | Encontrado |",
    "|----------|-------------|--------|------------------|------------|",
    ...(report.source.expectedFiles ?? []).map(
      (file) =>
        `| ${file.label} | ${file.required ? "sim" : "nao"} | ${file.status} | ${file.candidates.map(escapeTableCell).join("<br>")} | ${file.matchedFile ? escapeTableCell(file.matchedFile) : "-"} |`
    ),
    "",
    "## Contagens",
    "",
    "| Entidade | Origem | Normalizado | Diferença | Nota |",
    "|----------|--------|-------------|-----------|------|",
    ...report.counts.map((count) => `| ${count.entity} | ${count.source} | ${count.normalized} | ${count.difference} | ${count.note} |`),
    "",
    "## Dinheiro",
    "",
    "| Domínio | Chave | Valor | Status |",
    "|---------|-------|-------|--------|",
    ...report.money.map((money) => `| ${money.domain} | ${safeCell(money.entityKey)} | ${formatMoney(money.amountCents)} | ${money.status} |`),
    "",
    "## Imagens",
    "",
    "| SKU | Referências | Capa | Fallback | Status |",
    "|-----|-------------|------|----------|--------|",
    ...report.assets.map(
      (asset) =>
        `| ${safeCell(asset.productSku)} | ${asset.imageReferences} | ${asset.hasCover ? "sim" : "nao"} | ${asset.fallbackApproved ? "sim" : "nao"} | ${asset.status} |`
    ),
    "",
    "## Divergências",
    "",
    "| ID | Codigo | Severidade | Impacto | Origem | Corrigivel no Next | Dominio | Chave | Acao | Mensagem |",
    "|----|--------|------------|---------|--------|-------------------|---------|-------|------|----------|",
    ...report.divergences.map(
      (divergence) =>
        `| ${divergence.id} | ${divergence.code} | ${divergence.severity} | ${divergence.goLiveImpact} | ${divergence.origin} | ${divergence.nextFixable ? "sim" : "nao"} | ${divergence.domain} | ${safeCell(divergence.entityKey)} | ${divergence.recommendedAction} | ${safeCell(divergence.message)} |`
    ),
    ""
  ];

  return `${lines.join("\n")}\n`;
}

export function renderSanitizedSummaryMarkdown(report: ReconciliationReport) {
  const lines = [
    "# Reconciliation Summary Sanitized",
    "",
    `Gerado em: ${report.generatedAt}`,
    `Fonte: ${safeCell(report.source.pathLabel)}`,
    `Resultado: ${report.summary.goNoGo}`,
    "",
    "## Resumo agregado",
    "",
    "| Metrica | Valor |",
    "|---------|-------|",
    `| Bloqueadores | ${report.summary.blockers} |`,
    `| Avisos | ${report.summary.warnings} |`,
    `| Divergencias de dados | ${report.summary.byOrigin.dados} |`,
    `| Divergencias do Next | ${report.summary.byOrigin.next} |`,
    `| Divergencias de mapeamento | ${report.summary.byOrigin.mapeamento} |`,
    `| Pendencias humanas | ${report.summary.byOrigin.humana} |`,
    `| Secrets detectados | ${report.privacy.secretsDetected ? "sim" : "nao"} |`,
    "",
    "## Arquivos esperados",
    "",
    "| Entidade | Obrigatorio | Status |",
    "|----------|-------------|--------|",
    ...(report.source.expectedFiles ?? []).map((file) => `| ${file.label} | ${file.required ? "sim" : "nao"} | ${file.status} |`),
    "",
    "## Divergencias agregadas",
    "",
    "| Codigo | Severidade | Origem | Quantidade |",
    "|--------|------------|--------|------------|",
    ...summarizeDivergences(report).map(
      (item) => `| ${item.code} | ${item.severity} | ${item.origin} | ${item.count} |`
    ),
    "",
    "Resumo sanitizado: nao inclui linhas de origem, valores de campos, URLs privadas, caminhos de binarios reais ou identificadores alem de codigos agregados."
  ];

  return `${lines.join("\n")}\n`;
}

function summarizeDivergences(report: ReconciliationReport) {
  const items = new Map<string, { code: string; severity: string; origin: string; count: number }>();

  for (const divergence of report.divergences) {
    const key = `${divergence.code}:${divergence.severity}:${divergence.origin}`;
    const current = items.get(key) ?? {
      code: divergence.code,
      severity: divergence.severity,
      origin: divergence.origin,
      count: 0
    };
    current.count += 1;
    items.set(key, current);
  }

  return Array.from(items.values());
}

function sanitizeReportForOutput(report: ReconciliationReport): ReconciliationReport {
  return JSON.parse(JSON.stringify(report, (_key, value) => (typeof value === "string" ? redactUnsafeValue(value) : value))) as ReconciliationReport;
}

function safeCell(value: string) {
  return escapeTableCell(redactUnsafeValue(value));
}

function escapeTableCell(value: string) {
  return value.replace(/\|/g, "\\|");
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "default";
}
