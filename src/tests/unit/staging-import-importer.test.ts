import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { APPROVED_DRY_RUN_INPUT_DIR } from "@/features/data-dry-run/input-discovery";
import { buildStagingImportPlan } from "@/features/staging-import/import-plan";
import { executeStagingImport } from "@/features/staging-import/importer";
import { createPostImportReport, createPreImportReport } from "@/features/staging-import/report-writer";
import { createMemoryStagingImportStore } from "@/features/staging-import/staging-db";
import { runStagingImportPreflight } from "@/features/staging-import/preflight";
import { buildHumanApprovalChecklist } from "@/features/staging-import/human-approval";

function createTempCwd() {
  return mkdtempSync(join(tmpdir(), "triade-staging-importer-"));
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
  writeApprovedInput(cwd, "coupons.csv", "code,type,value,is_active\nBOASVINDAS,percentage,10,true\n");
  writeApprovedInput(cwd, "shipping.csv", "rule_code,name,uf,price_cents,estimated_days,is_active\nBR,Entrega Brasil,SP,1590,4,true\n");
}

describe("staging import importer", () => {
  it("upserts approved data into a memory store without real database", async () => {
    const cwd = createTempCwd();
    writeValidApprovedInput(cwd);
    const preflight = runStagingImportPreflight({
      cwd,
      target: "staging",
      mode: "upsert",
      confirmStaging: "confirmado",
      backupConfirmed: true,
      humanApprovalRef: "QA-001",
      env: {
        STAGING_DATABASE_URL: "postgres://staging-safe.invalid/db"
      }
    });
    const plan = buildStagingImportPlan({ cwd });
    const result = await executeStagingImport({
      preflight,
      plan,
      store: createMemoryStagingImportStore(),
      options: {
        allowReset: false,
        backupConfirmed: true,
        humanApprovalRef: "QA-001"
      }
    });

    expect(preflight.status).toBe("planned");
    expect(result.status).toBe("imported");
    expect(result.safety.productionConnectionAttempted).toBe(false);
    expect(result.counts.find((count) => count.entity === "products")?.inserted).toBe(1);
  });

  it("blocks reset without explicit reset guardrails", async () => {
    const cwd = createTempCwd();
    writeValidApprovedInput(cwd);
    const preflight = runStagingImportPreflight({
      cwd,
      target: "staging",
      mode: "reset-and-upsert",
      confirmStaging: "confirmado",
      backupConfirmed: true,
      humanApprovalRef: "QA-001",
      env: {
        STAGING_DATABASE_URL: "postgres://staging-safe.invalid/db"
      }
    });
    const plan = buildStagingImportPlan({ cwd });
    const result = await executeStagingImport({
      preflight,
      plan,
      store: createMemoryStagingImportStore(),
      options: {
        allowReset: false,
        backupConfirmed: true,
        humanApprovalRef: "QA-001"
      }
    });

    expect(preflight.status).toBe("blocked");
    expect(result.status).toBe("blocked");
    expect(result.divergences.some((divergence) => divergence.code === "RESET_BLOCKED")).toBe(true);
  });

  it("creates reports and human checklist without secret values", async () => {
    const cwd = createTempCwd();
    writeValidApprovedInput(cwd);
    const preflight = runStagingImportPreflight({
      cwd,
      target: "staging",
      mode: "upsert",
      confirmStaging: "confirmado",
      backupConfirmed: true,
      humanApprovalRef: "QA-001",
      env: {
        STAGING_DATABASE_URL: "postgres://staging-safe.invalid/db"
      }
    });
    const plan = buildStagingImportPlan({ cwd });
    const result = await executeStagingImport({
      preflight,
      plan,
      store: createMemoryStagingImportStore(),
      options: {
        allowReset: false,
        backupConfirmed: true,
        humanApprovalRef: "QA-001"
      }
    });
    const preReport = createPreImportReport(preflight);
    const postReport = createPostImportReport(result);
    const checklist = buildHumanApprovalChecklist(result);

    expect(JSON.stringify(preReport)).not.toContain("postgres://");
    expect(JSON.stringify(postReport)).not.toContain("postgres://");
    expect(checklist.decision).toBe("approved");
  });
});
