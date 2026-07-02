import { describe, expect, it } from "vitest";
import { loadDryRunInput } from "@/features/data-dry-run/input-discovery";
import { normalizeDryRunDataset } from "@/features/data-dry-run/normalize";
import { reconcileDryRunData } from "@/features/data-dry-run/reconciliation";
import { renderReconciliationMarkdown } from "@/features/data-dry-run/report-writer";
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
});
