import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { APPROVED_DRY_RUN_INPUT_DIR } from "@/features/data-dry-run/input-discovery";
import { runStagingImportPreflight } from "@/features/staging-import/preflight";

function createTempCwd() {
  return mkdtempSync(join(tmpdir(), "triade-staging-preflight-"));
}

function writeApprovedInput(cwd: string, file: string, content: string) {
  const inputDir = join(cwd, APPROVED_DRY_RUN_INPUT_DIR);
  mkdirSync(inputDir, { recursive: true });
  writeFileSync(join(inputDir, file), content, "utf8");
}

function writeValidApprovedInput(cwd: string) {
  writeApprovedInput(cwd, "categories.csv", "name,slug,is_active\nPerfumes,perfumes,true\n");
  writeApprovedInput(
    cwd,
    "products.csv",
    "sku,slug,name,category_slug,price_cents,status,published_at\nSKU-001,sku-001,Produto,perfumes,12990,published,2026-01-01T00:00:00-03:00\n"
  );
  writeApprovedInput(cwd, "product_images.csv", "product_sku,reference,is_cover\nSKU-001,legacy/sku-001.jpg,true\n");
  writeApprovedInput(cwd, "inventory.csv", "product_sku,stock_quantity,reserved_quantity,is_available\nSKU-001,3,1,true\n");
  writeApprovedInput(cwd, "shipping.csv", "rule_code,name,uf,price_cents,estimated_days,is_active\nBR,Entrega Brasil,SP,1590,4,true\n");
}

describe("staging import preflight", () => {
  it("returns pending-input without connecting when approved files are absent", () => {
    const cwd = createTempCwd();

    const preflight = runStagingImportPreflight({
      cwd,
      target: "staging",
      mode: "check",
      env: {}
    });

    expect(preflight.status).toBe("pending-input");
    expect(preflight.dryRun).toBeNull();
    expect(preflight.issues.some((issue) => issue.code === "INPUT_PENDING")).toBe(true);
  });

  it("blocks when dry-run has critical or blocking divergences", () => {
    const cwd = createTempCwd();
    writeApprovedInput(cwd, "categories.csv", "name,slug,is_active\nPerfumes,perfumes,true\n");
    writeApprovedInput(
      cwd,
      "products.csv",
      "sku,slug,name,category_slug,price_cents,status,published_at\nSKU-001,sku-001,Produto,perfumes,12990,published,2026-01-01T00:00:00-03:00\n"
    );
    writeApprovedInput(cwd, "product_images.csv", "product_sku,reference,is_cover\nSKU-999,legacy/missing.jpg,true\n");
    writeApprovedInput(cwd, "inventory.csv", "product_sku,stock_quantity,reserved_quantity,is_available\nSKU-001,3,1,true\n");
    writeApprovedInput(cwd, "shipping.csv", "rule_code,name,uf,price_cents,estimated_days,is_active\nBR,Entrega Brasil,SP,1590,4,true\n");

    const preflight = runStagingImportPreflight({
      cwd,
      target: "staging",
      mode: "check",
      env: {}
    });

    expect(preflight.status).toBe("blocked");
    expect(preflight.dryRun?.status).toBe("no-go");
    expect(preflight.issues.some((issue) => issue.code === "DRY_RUN_BLOCKED")).toBe(true);
  });

  it("plans check mode when input and dry-run are go", () => {
    const cwd = createTempCwd();
    writeValidApprovedInput(cwd);

    const preflight = runStagingImportPreflight({
      cwd,
      target: "staging",
      mode: "check",
      env: {}
    });

    expect(preflight.status).toBe("planned");
    expect(preflight.dryRun?.status).toBe("go");
    expect(preflight.connectionVariablePresent).toBe(false);
  });

  it("requires backup, env and human approval for upsert writes", () => {
    const cwd = createTempCwd();
    writeValidApprovedInput(cwd);

    const preflight = runStagingImportPreflight({
      cwd,
      target: "staging",
      mode: "upsert",
      env: {}
    });

    expect(preflight.status).toBe("blocked");
    expect(preflight.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["TARGET_NOT_APPROVED", "APPROVAL_REQUIRED", "BACKUP_REQUIRED"])
    );
  });
});
