import { countPlanInputs } from "./import-plan";
import { validateResetRequest } from "./reset-guard";
import type { ResetPlan, StagingImportCliOptions, StagingImportPlan, StagingPreflightResult } from "./types";

export function createResetPlan(
  plan: StagingImportPlan,
  preflight: StagingPreflightResult,
  options: Pick<StagingImportCliOptions, "allowReset" | "backupConfirmed" | "humanApprovalRef">
): ResetPlan {
  const validation = validateResetRequest(preflight, options);

  if (preflight.mode !== "reset-and-upsert") {
    return {
      allowed: false,
      entities: [],
      reason: "Modo atual nao solicita reset.",
      estimatedKeys: countPlanInputs(plan)
    };
  }

  return {
    allowed: validation.allowed,
    entities: ["productImages", "inventory", "products", "categories", "coupons", "shippingRules"],
    reason: validation.allowed
      ? "Reset escopado permitido por backup, flag, aprovacao humana e ambiente nao produtivo."
      : validation.issues.map((issue) => issue.message).join(" "),
    estimatedKeys: countPlanInputs(plan)
  };
}
