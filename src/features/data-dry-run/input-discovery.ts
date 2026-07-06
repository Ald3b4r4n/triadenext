import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { inputFileSpecs, parseInputFile } from "./input-contracts";
import { createIssue, scanPathForUnsafeValue } from "./safety";
import type {
  DryRunEntity,
  DryRunExpectedFile,
  DryRunInputStatus,
  ParsedInputDataset,
  ParsedRecord,
  SourceMetadata
} from "./types";

export const DRY_RUN_INPUT_ROOT = "data/dry-run/input";
export const DRY_RUN_EXAMPLES_DIR = "data/dry-run/input/examples";
export const APPROVED_DRY_RUN_EXECUTION = "primeira-execucao";
export const APPROVED_DRY_RUN_INPUT_DIR = `${DRY_RUN_INPUT_ROOT}/${APPROVED_DRY_RUN_EXECUTION}`;
export const DRY_RUN_OUTPUT_ROOT = "data/dry-run/output";

export interface DiscoverInputOptions {
  cwd?: string;
  inputDir?: string;
}

export interface DryRunInputDiscovery {
  inputDir: string;
  pathLabel: string;
  source: SourceMetadata;
  status: DryRunInputStatus;
  exists: boolean;
  hasAnyExpectedFile: boolean;
  expectedFiles: DryRunExpectedFile[];
  issues: ParsedInputDataset["issues"];
}

export function resolveSafeInputDir(options: DiscoverInputOptions = {}) {
  const cwd = options.cwd ?? process.cwd();
  const requested = options.inputDir ?? defaultInputDir(cwd);
  const resolved = isAbsolute(requested)
    ? resolve(requested)
    : resolve(cwd, requested);
  const allowedRoot = resolve(cwd, DRY_RUN_INPUT_ROOT);

  assertInside(
    resolved,
    allowedRoot,
    "Pasta de entrada precisa ficar dentro de data/dry-run/input/."
  );
  return resolved;
}

export function resolveApprovedDryRunInputDir(cwd = process.cwd()) {
  return resolveSafeInputDir({ cwd, inputDir: APPROVED_DRY_RUN_INPUT_DIR });
}

export function resolveSafeOutputDir(
  cwd = process.cwd(),
  outputDir = DRY_RUN_OUTPUT_ROOT
) {
  const resolved = isAbsolute(outputDir)
    ? resolve(outputDir)
    : resolve(cwd, outputDir);
  const allowedRoot = resolve(cwd, DRY_RUN_OUTPUT_ROOT);

  assertInside(
    resolved,
    allowedRoot,
    "Pasta de saida precisa ficar dentro de data/dry-run/output/."
  );
  return resolved;
}

export function loadDryRunInput(
  options: DiscoverInputOptions = {}
): ParsedInputDataset {
  const discovery = inspectDryRunInput(options);
  const inputDir = discovery.inputDir;
  const records: Partial<Record<DryRunEntity, ParsedRecord[]>> = {};
  const issues = [...discovery.issues];

  if (!discovery.exists) {
    issues.push(
      createIssue({
        code: "INPUT_MISSING",
        severity: "HIGH",
        goLiveImpact: "bloqueador",
        message: "Pasta de entrada do dry-run não existe.",
        recommendedAction: "corrigir-origem"
      })
    );
  } else {
    const files = new Set(readdirSync(inputDir));

    for (const spec of inputFileSpecs) {
      const fileName = spec.candidates.find((candidate) =>
        files.has(candidate)
      );

      if (!fileName) {
        if (spec.required) {
          issues.push(
            createIssue({
              code: "INPUT_MISSING",
              entity: spec.entity,
              severity: "HIGH",
              goLiveImpact: "bloqueador",
              message: `Arquivo obrigatorio ausente para ${spec.label}.`,
              recommendedAction: "corrigir-origem"
            })
          );
        }
        records[spec.entity] = [];
        continue;
      }

      const parsed = parseInputFile(spec, join(inputDir, fileName));
      records[spec.entity] = parsed.records;
      issues.push(
        ...parsed.issues.map((issue) => ({
          ...issue,
          entity: issue.entity ?? spec.entity
        }))
      );
    }
  }

  return { source: discovery.source, records, issues };
}

export function inspectDryRunInput(
  options: DiscoverInputOptions = {}
): DryRunInputDiscovery {
  const cwd = options.cwd ?? process.cwd();
  const inputDir = resolveSafeInputDir(options);
  const pathLabel =
    relative(cwd, inputDir).replace(/\\/g, "/") || DRY_RUN_INPUT_ROOT;
  const exists = existsSync(inputDir);
  const files = exists ? new Set(readdirSync(inputDir)) : new Set<string>();
  const isApproved =
    normalizePathLabel(pathLabel) === APPROVED_DRY_RUN_INPUT_DIR;
  const expectedFiles = buildExpectedFiles(files, isApproved);
  const hasAnyExpectedFile = expectedFiles.some(
    (file) => file.status === "present"
  );
  const requiredMissing = expectedFiles.some(
    (file) => file.required && file.status === "missing"
  );
  const status: DryRunInputStatus =
    isApproved && (!exists || !hasAnyExpectedFile || requiredMissing)
      ? "pending-input"
      : "ready";
  const source: SourceMetadata = {
    type: "local-files",
    pathLabel,
    approvedBy: "manual",
    containsSensitiveData: false,
    executionName: isApproved ? APPROVED_DRY_RUN_EXECUTION : undefined,
    inputStatus: status,
    expectedFiles
  };

  return {
    inputDir,
    pathLabel,
    source,
    status,
    exists,
    hasAnyExpectedFile,
    expectedFiles,
    issues: scanPathForUnsafeValue(pathLabel)
  };
}

function buildExpectedFiles(
  files: Set<string>,
  approvedOnly: boolean
): DryRunExpectedFile[] {
  return inputFileSpecs.map((spec) => {
    const candidates = approvedOnly
      ? spec.candidates.filter((candidate) => !candidate.includes(".example."))
      : spec.candidates;
    const matchedFile =
      candidates.find((candidate) => files.has(candidate)) ?? null;

    return {
      entity: spec.entity,
      label: spec.label,
      required: approvedOnly ? spec.requiredForApprovedInput : spec.required,
      candidates,
      matchedFile,
      status: matchedFile ? "present" : "missing"
    };
  });
}

export function ensureDryRunOutputDir(outputDir: string) {
  mkdirSync(outputDir, { recursive: true });
}

function defaultInputDir(cwd: string) {
  const examplesDir = resolve(cwd, DRY_RUN_EXAMPLES_DIR);

  if (existsSync(examplesDir)) {
    return DRY_RUN_EXAMPLES_DIR;
  }

  return DRY_RUN_INPUT_ROOT;
}

function normalizePathLabel(pathLabel: string) {
  return pathLabel.replace(/\\/g, "/");
}

function assertInside(target: string, root: string, message: string) {
  const rel = relative(root, target);

  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(message);
  }
}
