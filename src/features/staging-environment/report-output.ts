import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import type { StagingEnvironmentReport } from "./report";
import { sanitizeStagingReport } from "./safety";
export const STAGING_ENVIRONMENT_OUTPUT_ROOT = "data/dry-run/output";
export function writeStagingEnvironmentReport(
  report: StagingEnvironmentReport,
  options: { cwd?: string; outputDir?: string } = {}
) {
  const cwd = options.cwd ?? process.cwd();
  const allowed = resolve(cwd, STAGING_ENVIRONMENT_OUTPUT_ROOT);
  const root = options.outputDir
    ? isAbsolute(options.outputDir)
      ? resolve(options.outputDir)
      : resolve(cwd, options.outputDir)
    : allowed;
  const rel = relative(allowed, root);
  if (rel.startsWith("..") || isAbsolute(rel))
    throw new Error(
      "Relatórios staging environment devem ficar em data/dry-run/output/."
    );
  const dir = join(root, `staging-environment-${report.status}`);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const sanitized = sanitizeStagingReport(report);
  const json = join(dir, "staging-environment-report.json");
  const markdown = join(dir, "staging-environment-report.md");
  writeFileSync(json, `${JSON.stringify(sanitized, null, 2)}\n`, "utf8");
  writeFileSync(markdown, `${renderMarkdown(sanitized)}\n`, "utf8");
  return [json, markdown];
}
function renderMarkdown(report: StagingEnvironmentReport) {
  return [
    "# Relatório do ambiente staging",
    "",
    `Status: ${report.status}`,
    `Decisão: ${report.decision}`,
    "",
    "| Etapa | Status | Resumo |",
    "| --- | --- | --- |",
    ...report.sections.map(
      (section) =>
        `| ${section.label} | ${section.status} | ${section.summary} |`
    ),
    "",
    "Nenhuma URL, DATABASE_URL, chave Stripe ou webhook secret é incluído."
  ].join("\n");
}
