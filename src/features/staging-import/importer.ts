import { issuesToStagingDivergences } from "./divergences";
import { createResetPlan } from "./reset-plan";
import { validateResetRequest } from "./reset-guard";
import { upsertAssetsAndInventory } from "./upsert-assets-inventory";
import { upsertCatalog } from "./upsert-catalog";
import { upsertCommercialRules } from "./upsert-commercial";
import type {
  EntityWriteSummary,
  ResetExecutionResult,
  StagingImportCliOptions,
  StagingImportExecutionResult,
  StagingImportPlan,
  StagingImportStore,
  StagingPreflightResult
} from "./types";

export async function executeStagingImport(input: {
  preflight: StagingPreflightResult;
  plan: StagingImportPlan;
  store: StagingImportStore;
  options: Pick<StagingImportCliOptions, "allowReset" | "backupConfirmed" | "humanApprovalRef">;
}): Promise<StagingImportExecutionResult> {
  const generatedAt = new Date().toISOString();

  if (input.preflight.status !== "planned" || input.preflight.mode === "check") {
    return emptyExecution({
      generatedAt,
      status: input.preflight.status,
      preflight: input.preflight,
      mode: input.preflight.mode
    });
  }

  const resetValidation = validateResetRequest(input.preflight, input.options);
  if (!resetValidation.allowed) {
    return {
      ...emptyExecution({
        generatedAt,
        status: "blocked",
        preflight: input.preflight,
        mode: input.preflight.mode
      }),
      divergences: issuesToStagingDivergences(resetValidation.issues)
    };
  }

  return input.store.runInTransaction(async (transactionalStore) => {
    const reset = input.preflight.mode === "reset-and-upsert"
      ? await executeProtectedReset(transactionalStore, input.plan, input.preflight, input.options)
      : null;
    const counts = [
      ...(await upsertCatalog(transactionalStore, input.plan)),
      ...(await upsertAssetsAndInventory(transactionalStore, input.plan)),
      ...(await upsertCommercialRules(transactionalStore, input.plan))
    ];

    return {
      schemaVersion: 1,
      generatedAt,
      status: "imported",
      mode: input.preflight.mode,
      preflight: input.preflight,
      counts,
      divergences: [],
      reset,
      safety: safetyFlags()
    };
  });
}

async function executeProtectedReset(
  store: StagingImportStore,
  plan: StagingImportPlan,
  preflight: StagingPreflightResult,
  options: Pick<StagingImportCliOptions, "allowReset" | "backupConfirmed" | "humanApprovalRef">
): Promise<ResetExecutionResult> {
  const resetPlan = createResetPlan(plan, preflight, options);
  if (!resetPlan.allowed) {
    return {
      status: "skipped",
      summary: [],
      message: resetPlan.reason
    };
  }

  return store.resetApprovedScope(plan);
}

function emptyExecution(input: {
  generatedAt: string;
  status: StagingImportExecutionResult["status"];
  mode: StagingImportExecutionResult["mode"];
  preflight: StagingPreflightResult;
}): StagingImportExecutionResult {
  return {
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    status: input.status,
    mode: input.mode,
    preflight: input.preflight,
    counts: emptyCounts(),
    divergences: issuesToStagingDivergences(input.preflight.issues),
    reset: null,
    safety: safetyFlags()
  };
}

function emptyCounts(): EntityWriteSummary[] {
  return ["categories", "products", "productImages", "inventory", "coupons", "shippingRules"].map((entity) => ({
    entity: entity as EntityWriteSummary["entity"],
    input: 0,
    before: 0,
    after: 0,
    inserted: 0,
    updated: 0,
    skipped: 0
  }));
}

function safetyFlags() {
  return {
    productionConnectionAttempted: false as const,
    secretsPrinted: false as const,
    databaseUrlPrinted: false as const,
    realDeploy: false as const,
    realMigration: false as const,
    legacyTouched: false as const
  };
}
