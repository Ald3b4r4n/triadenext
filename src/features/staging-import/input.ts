import {
  APPROVED_DRY_RUN_INPUT_DIR,
  inspectDryRunInput,
  loadDryRunInput
} from "@/features/data-dry-run/input-discovery";
import { normalizeDryRunDataset } from "@/features/data-dry-run/normalize";
import type { ParsedInputDataset } from "@/features/data-dry-run/types";
import type { ApprovedInputSummary, ImportEntityName } from "./types";

export function inspectApprovedStagingInput(options: { cwd?: string; inputDir?: string } = {}) {
  const discovery = inspectDryRunInput({
    cwd: options.cwd,
    inputDir: options.inputDir ?? APPROVED_DRY_RUN_INPUT_DIR
  });

  return {
    discovery,
    summary: createApprovedInputSummary(discovery, null)
  };
}

export function loadApprovedStagingInput(options: { cwd?: string; inputDir?: string } = {}) {
  const dataset = loadDryRunInput({
    cwd: options.cwd,
    inputDir: options.inputDir ?? APPROVED_DRY_RUN_INPUT_DIR
  });
  const normalized = normalizeDryRunDataset(dataset);
  return { dataset, normalized, summary: createApprovedInputSummaryFromDataset(dataset) };
}

function createApprovedInputSummary(
  discovery: ReturnType<typeof inspectDryRunInput>,
  recordCounts: ApprovedInputSummary["recordCounts"] | null
): ApprovedInputSummary {
  return {
    pathLabel: discovery.pathLabel,
    status: discovery.status,
    expectedFiles: discovery.expectedFiles.map((file) => ({
      entity: file.entity as ImportEntityName,
      label: file.label,
      required: file.required,
      status: file.status,
      matchedFile: file.matchedFile,
      candidates: file.candidates
    })),
    recordCounts: recordCounts ?? {}
  };
}

function createApprovedInputSummaryFromDataset(dataset: ParsedInputDataset): ApprovedInputSummary {
  const counts: ApprovedInputSummary["recordCounts"] = {
    categories: dataset.records.categories?.length ?? 0,
    products: dataset.records.products?.length ?? 0,
    productImages: dataset.records.productImages?.length ?? 0,
    inventory: dataset.records.inventory?.length ?? 0,
    coupons: dataset.records.coupons?.length ?? 0,
    shippingRules: dataset.records.shippingRules?.length ?? 0
  };

  return {
    pathLabel: dataset.source.pathLabel,
    status: dataset.source.inputStatus ?? "ready",
    expectedFiles:
      dataset.source.expectedFiles?.map((file) => ({
        entity: file.entity as ImportEntityName,
        label: file.label,
        required: file.required,
        status: file.status,
        matchedFile: file.matchedFile,
        candidates: file.candidates
      })) ?? [],
    recordCounts: counts
  };
}
