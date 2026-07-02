import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { APPROVED_DRY_RUN_INPUT_DIR, loadDryRunInput } from "@/features/data-dry-run/input-discovery";
import { normalizeDryRunDataset } from "@/features/data-dry-run/normalize";
import { reconcileDryRunData } from "@/features/data-dry-run/reconciliation";
import { renderReconciliationMarkdown, renderSanitizedSummaryMarkdown } from "@/features/data-dry-run/report-writer";
import { runDataDryRun } from "@/features/data-dry-run/run-dry-run";
import { scanRecordsForUnsafeValues } from "@/features/data-dry-run/safety";
import type { ParsedInputDataset, ParsedRecord } from "@/features/data-dry-run/types";

describe("data dry-run reconciliation", () => {
  it("generates a go report for safe example files", () => {
    const dataset = loadDryRunInput({ inputDir: "data/dry-run/input/examples" });
    const normalized = normalizeDryRunDataset(dataset);
    const report = reconcileDryRunData(dataset, normalized);

    expect(report.summary.goNoGo).toBe("go");
    expect(report.counts.find((count) => count.entity === "products")?.normalized).toBe(2);
    expect(report.privacy.secretsDetected).toBe(false);
  });

  it("keeps markdown reports free from raw secret-like input", () => {
    const productRecords: ParsedRecord[] = [
      {
        file: "products.csv",
        lineNumber: 2,
        values: {
          sku: "SKU-SAFE",
          slug: "sku-safe",
          name: "Produto Seguro",
          category_slug: "perfumes",
          price_cents: "12990",
          stock_quantity: "1",
          status: "draft",
          description: "DATABASE_URL=REDACTED_TEST_ONLY"
        }
      }
    ];
    const dataset: ParsedInputDataset = {
      source: {
        type: "local-files",
        pathLabel: "data/dry-run/input/test",
        approvedBy: "manual",
        containsSensitiveData: false
      },
      records: {
        products: productRecords
      },
      issues: scanRecordsForUnsafeValues(productRecords, "products")
    };
    const normalized = normalizeDryRunDataset(dataset);
    const report = reconcileDryRunData(dataset, normalized);
    const markdown = renderReconciliationMarkdown(report);

    expect(report.summary.goNoGo).toBe("no-go");
    expect(markdown).not.toContain("REDACTED_TEST_ONLY");
    expect(markdown).toContain("UNSAFE_INPUT");
  });

  it("classifies divergence origins and next-fixable mapping problems", () => {
    const productRecords: ParsedRecord[] = [
      {
        file: "products.csv",
        lineNumber: 2,
        values: {
          sku: "SKU-001",
          slug: "sku-001",
          name: "Produto",
          category_slug: "perfumes",
          price_cents: "1000",
          stock_quantity: "1",
          status: "unknown"
        }
      }
    ];
    const dataset: ParsedInputDataset = {
      source: { type: "local-files", pathLabel: "data/dry-run/input/test", approvedBy: "manual", containsSensitiveData: false },
      records: { products: productRecords },
      issues: []
    };
    const report = reconcileDryRunData(dataset, normalizeDryRunDataset(dataset));
    const mappingDivergence = report.divergences.find((divergence) => divergence.origin === "mapeamento");

    expect(report.summary.byOrigin.mapeamento).toBeGreaterThan(0);
    expect(mappingDivergence?.nextFixable).toBe(true);
    expect(mappingDivergence?.message).not.toContain("unknown");
  });

  it("renders pending-input and sanitized summaries without raw record values", () => {
    const cwd = mkdtempSync(join(tmpdir(), "triade-pending-summary-"));
    const result = runDataDryRun({
      cwd,
      inputDir: APPROVED_DRY_RUN_INPUT_DIR,
      writeReport: false
    });
    const summary = renderSanitizedSummaryMarkdown(result.report);

    expect(result.report.summary.goNoGo).toBe("pending-input");
    expect(summary).toContain("pending-input");
    expect(summary).toContain("Arquivos esperados");
    expect(summary).not.toContain("legacy/sku-001.jpg");
  });
});
