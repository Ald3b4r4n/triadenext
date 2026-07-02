import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { APPROVED_DRY_RUN_INPUT_DIR, inspectDryRunInput } from "@/features/data-dry-run/input-discovery";
import { runDataDryRun } from "@/features/data-dry-run/run-dry-run";

function createTempCwd() {
  return mkdtempSync(join(tmpdir(), "triade-dry-run-"));
}

function writeApprovedInput(cwd: string, file: string, content: string) {
  const inputDir = join(cwd, APPROVED_DRY_RUN_INPUT_DIR);
  mkdirSync(inputDir, { recursive: true });
  writeFileSync(join(inputDir, file), content, "utf8");
}

describe("approved data dry-run input", () => {
  it("returns pending-input when primeira-execucao is absent", () => {
    const cwd = createTempCwd();

    const result = runDataDryRun({
      cwd,
      inputDir: APPROVED_DRY_RUN_INPUT_DIR,
      writeReport: false
    });

    expect(result.report.summary.goNoGo).toBe("pending-input");
    expect(result.report.summary.blockers).toBe(0);
    expect(result.report.source.expectedFiles?.some((file) => file.status === "missing")).toBe(true);
  });

  it("returns pending-input when primeira-execucao exists but is empty", () => {
    const cwd = createTempCwd();
    mkdirSync(join(cwd, APPROVED_DRY_RUN_INPUT_DIR), { recursive: true });

    const discovery = inspectDryRunInput({ cwd, inputDir: APPROVED_DRY_RUN_INPUT_DIR });

    expect(discovery.status).toBe("pending-input");
    expect(discovery.hasAnyExpectedFile).toBe(false);
  });

  it("runs approved input when all required files are present", () => {
    const cwd = createTempCwd();
    writeApprovedInput(cwd, "categories.csv", "name,slug,is_active\nPerfumes,perfumes,true\n");
    writeApprovedInput(
      cwd,
      "products.csv",
      "sku,slug,name,category_slug,price_cents,status,published_at\nSKU-001,sku-001,Produto,perfumes,12990,published,2026-01-01T00:00:00-03:00\n"
    );
    writeApprovedInput(cwd, "product_images.csv", "product_sku,reference,is_cover\nSKU-001,legacy/sku-001.jpg,true\n");
    writeApprovedInput(cwd, "inventory.csv", "product_sku,stock_quantity,reserved_quantity,is_available\nSKU-001,3,1,true\n");
    writeApprovedInput(
      cwd,
      "shipping.csv",
      "rule_code,name,uf,price_cents,estimated_days,is_active\nBR,Entrega Brasil,SP,1590,4,true\n"
    );

    const result = runDataDryRun({
      cwd,
      inputDir: APPROVED_DRY_RUN_INPUT_DIR,
      writeReport: false
    });

    expect(result.report.summary.goNoGo).toBe("go");
    expect(result.report.counts.find((count) => count.entity === "inventory")?.normalized).toBe(1);
    expect(result.report.divergences).toHaveLength(0);
  });
});
