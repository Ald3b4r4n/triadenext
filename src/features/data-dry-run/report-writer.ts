import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { formatMoney } from "@/lib/money";
import { ensureDryRunOutputDir } from "./input-discovery";
import type { ReconciliationReport, ReportFormat } from "./types";

export function writeReconciliationReport(report: ReconciliationReport, outputDir: string, format: ReportFormat = "both") {
  ensureDryRunOutputDir(outputDir);
  const files: string[] = [];

  if (format === "json" || format === "both") {
    const path = join(outputDir, "reconciliation-report.json");
    writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    files.push(path);
  }

  if (format === "markdown" || format === "both") {
    const path = join(outputDir, "reconciliation-report.md");
    writeFileSync(path, renderReconciliationMarkdown(report), "utf8");
    files.push(path);
  }

  return files;
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
    ...report.money.map((money) => `| ${money.domain} | ${money.entityKey} | ${formatMoney(money.amountCents)} | ${money.status} |`),
    "",
    "## Imagens",
    "",
    "| SKU | Referências | Capa | Fallback | Status |",
    "|-----|-------------|------|----------|--------|",
    ...report.assets.map(
      (asset) =>
        `| ${asset.productSku} | ${asset.imageReferences} | ${asset.hasCover ? "sim" : "nao"} | ${asset.fallbackApproved ? "sim" : "nao"} | ${asset.status} |`
    ),
    "",
    "## Divergências",
    "",
    "| ID | Codigo | Severidade | Impacto | Dominio | Chave | Acao | Mensagem |",
    "|----|--------|------------|---------|---------|-------|------|----------|",
    ...report.divergences.map(
      (divergence) =>
        `| ${divergence.id} | ${divergence.code} | ${divergence.severity} | ${divergence.goLiveImpact} | ${divergence.domain} | ${divergence.entityKey} | ${divergence.recommendedAction} | ${divergence.message} |`
    ),
    ""
  ];

  return `${lines.join("\n")}\n`;
}
