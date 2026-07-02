import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { inputFileSpecs } from "@/features/data-dry-run/input-contracts";
import { APPROVED_DRY_RUN_INPUT_DIR, inspectDryRunInput, loadDryRunInput } from "@/features/data-dry-run/input-discovery";

function createApprovedDir() {
  const cwd = mkdtempSync(join(tmpdir(), "triade-contracts-"));
  const inputDir = join(cwd, APPROVED_DRY_RUN_INPUT_DIR);
  mkdirSync(inputDir, { recursive: true });
  return { cwd, inputDir };
}

describe("approved data dry-run contracts", () => {
  it("documents primary names for image, inventory and shipping files", () => {
    expect(inputFileSpecs.find((spec) => spec.entity === "productImages")?.candidates).toEqual(
      expect.arrayContaining(["product_images.csv", "product_images.json", "product-images.csv", "product-images.json"])
    );
    expect(inputFileSpecs.find((spec) => spec.entity === "inventory")?.candidates).toEqual(
      expect.arrayContaining(["inventory.csv", "inventory.json"])
    );
    expect(inputFileSpecs.find((spec) => spec.entity === "shippingRules")?.candidates).toEqual(
      expect.arrayContaining(["shipping.csv", "shipping.json", "shipping-rules.csv", "shipping-rules.json"])
    );
  });

  it("accepts phase 14 aliases while requiring approved inventory", () => {
    const { cwd, inputDir } = createApprovedDir();
    writeFileSync(join(inputDir, "categories.csv"), "name,slug\nPerfumes,perfumes\n", "utf8");
    writeFileSync(
      join(inputDir, "products.csv"),
      "sku,slug,name,category_slug,price_cents,status,published_at\nSKU-001,sku-001,Produto,perfumes,1000,draft,\n",
      "utf8"
    );
    writeFileSync(join(inputDir, "product-images.csv"), "product_sku,reference,is_cover\nSKU-001,legacy.jpg,true\n", "utf8");
    writeFileSync(join(inputDir, "inventory.csv"), "product_sku,stock_quantity\nSKU-001,1\n", "utf8");
    writeFileSync(join(inputDir, "shipping-rules.csv"), "rule_code,name,uf,price_cents,estimated_days,is_active\nSP,Sao Paulo,SP,1000,2,true\n", "utf8");

    const discovery = inspectDryRunInput({ cwd, inputDir: APPROVED_DRY_RUN_INPUT_DIR });
    const dataset = loadDryRunInput({ cwd, inputDir: APPROVED_DRY_RUN_INPUT_DIR });

    expect(discovery.status).toBe("ready");
    expect(discovery.expectedFiles.find((file) => file.entity === "productImages")?.matchedFile).toBe("product-images.csv");
    expect(discovery.expectedFiles.find((file) => file.entity === "shippingRules")?.matchedFile).toBe("shipping-rules.csv");
    expect(dataset.records.inventory).toHaveLength(1);
    expect(dataset.issues.filter((issue) => issue.code === "INPUT_MISSING")).toHaveLength(0);
  });
});
