import { APPROVED_DRY_RUN_INPUT_DIR } from "@/features/data-dry-run/input-discovery";
import { normalizeDryRunDataset } from "@/features/data-dry-run/normalize";
import { reconcileDryRunData } from "@/features/data-dry-run/reconciliation";
import { loadApprovedStagingInput } from "./input";
import type { ImportEntityName, StagingImportPlan } from "./types";

export function buildStagingImportPlan(options: { cwd?: string; inputDir?: string } = {}): StagingImportPlan {
  const loaded = loadApprovedStagingInput({
    cwd: options.cwd,
    inputDir: options.inputDir ?? APPROVED_DRY_RUN_INPUT_DIR
  });
  const data = normalizeDryRunDataset(loaded.dataset);
  const sourceReport = reconcileDryRunData(loaded.dataset, data);

  return {
    sourceReport,
    data,
    entities: {
      categories: data.categories,
      products: data.products,
      productImages: data.productImages,
      inventory: data.inventory,
      coupons: data.coupons,
      shippingRules: data.shippingRules
    },
    naturalKeys: naturalKeys()
  };
}

export function naturalKeys(): Record<ImportEntityName, string[]> {
  return {
    categories: ["slug"],
    products: ["sku", "slug"],
    productImages: ["productSku", "reference"],
    inventory: ["productSku"],
    coupons: ["code"],
    shippingRules: ["ruleCode"]
  };
}

export function countPlanInputs(plan: StagingImportPlan): Record<ImportEntityName, number> {
  return {
    categories: plan.entities.categories.length,
    products: plan.entities.products.length,
    productImages: plan.entities.productImages.length,
    inventory: plan.entities.inventory.length,
    coupons: plan.entities.coupons.length,
    shippingRules: plan.entities.shippingRules.length
  };
}
