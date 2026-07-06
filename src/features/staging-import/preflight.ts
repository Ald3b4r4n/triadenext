import { APPROVED_DRY_RUN_INPUT_DIR } from "@/features/data-dry-run/input-discovery";
import {
  createStagingEnvironment,
  requiresRemoteWrite,
  resolveStagingProvider,
  resolveStagingTarget
} from "./environment";
import { evaluateDryRunGate } from "./dry-run-gate";
import { inspectApprovedStagingInput } from "./input";
import { detectProductionSignals } from "./production-guard";
import type {
  StagingEnv,
  StagingImportCliOptions,
  StagingImportIssue,
  StagingPreflightResult
} from "./types";

export function runStagingImportPreflight(
  options: Partial<StagingImportCliOptions> & { env?: StagingEnv } = {}
): StagingPreflightResult {
  const cwd = options.cwd ?? process.cwd();
  const mode = options.mode ?? "check";
  const env = options.env ?? process.env;
  const target = resolveStagingTarget(options.target);
  const provider = resolveStagingProvider(options.provider);
  const generatedAt = new Date().toISOString();
  const issues: StagingImportIssue[] = [];
  const approval = {
    required: requiresRemoteWrite(mode),
    provided: Boolean(options.humanApprovalRef?.trim()),
    reference: options.humanApprovalRef?.trim() ?? null
  };
  const backup = {
    required: requiresRemoteWrite(mode),
    confirmed: options.backupConfirmed === true
  };

  if (!target) {
    issues.push({
      code: "TARGET_NOT_APPROVED",
      severity: "HIGH",
      origin: "humana",
      entity: "environment",
      message: "Informe --target staging, preview ou remote-dev.",
      recommendedAction: "corrigir-origem",
      blocksImport: true
    });
  }

  const environment = target
    ? createStagingEnvironment(target, provider)
    : null;
  const guard = detectProductionSignals({
    target: options.target,
    labels: {
      target: options.target,
      provider,
      "connection-string": env.STAGING_DATABASE_URL,
      "vercel-env": env.VERCEL_ENV,
      "node-env": env.NODE_ENV
    },
    env
  });
  issues.push(...guard.issues);

  const inputInspection = inspectApprovedStagingInput({
    cwd,
    inputDir: options.inputDir ?? APPROVED_DRY_RUN_INPUT_DIR
  });
  const inputSummary = inputInspection.summary;

  if (inputInspection.discovery.status === "pending-input") {
    issues.push({
      code: "INPUT_PENDING",
      severity: "LOW",
      origin: "humana",
      entity: "environment",
      message:
        "Arquivos aprovados ausentes ou incompletos em data/dry-run/input/primeira-execucao/.",
      recommendedAction: "nova-fase",
      blocksImport: false
    });
  }

  if (requiresRemoteWrite(mode)) {
    if (!env.STAGING_DATABASE_URL?.trim()) {
      issues.push({
        code: "TARGET_NOT_APPROVED",
        severity: "HIGH",
        origin: "humana",
        entity: "database",
        message:
          "Variavel STAGING_DATABASE_URL ausente; escrita remota bloqueada sem imprimir valor.",
        recommendedAction: "nova-fase",
        blocksImport: true
      });
    }

    if (!options.confirmStaging?.trim()) {
      issues.push({
        code: "APPROVAL_REQUIRED",
        severity: "HIGH",
        origin: "humana",
        entity: "environment",
        message: "Escrita staging exige --confirm-staging.",
        recommendedAction: "nova-fase",
        blocksImport: true
      });
    }

    if (!approval.provided) {
      issues.push({
        code: "APPROVAL_REQUIRED",
        severity: "HIGH",
        origin: "humana",
        entity: "environment",
        message: "Escrita staging exige referência de aprovação humana.",
        recommendedAction: "nova-fase",
        blocksImport: true
      });
    }

    if (!backup.confirmed) {
      issues.push({
        code: "BACKUP_REQUIRED",
        severity: "HIGH",
        origin: "humana",
        entity: "database",
        message: "Escrita staging exige snapshot/backup confirmado.",
        recommendedAction: "nova-fase",
        blocksImport: true
      });
    }
  }

  if (mode === "reset-and-upsert" && !options.allowReset) {
    issues.push({
      code: "RESET_BLOCKED",
      severity: "CRITICAL",
      origin: "humana",
      entity: "database",
      message:
        "Reset exige --allow-reset além de backup, aprovação e alvo não produtivo.",
      recommendedAction: "nova-fase",
      blocksImport: true
    });
  }

  const dryRun =
    inputInspection.discovery.status === "pending-input"
      ? null
      : evaluateDryRunGate({
          cwd,
          inputDir: options.inputDir ?? APPROVED_DRY_RUN_INPUT_DIR,
          approvedWithoutCriticalBlockers: Boolean(options.dryRunApprovalRef)
        });

  if (dryRun && !dryRun.accepted) {
    issues.push(...dryRun.issues);
  }

  const hasBlockingIssue = issues.some((issue) => issue.blocksImport);
  const status = hasBlockingIssue
    ? "blocked"
    : inputInspection.discovery.status === "pending-input"
      ? "pending-input"
      : "planned";

  return {
    schemaVersion: 1,
    generatedAt,
    feature: "024-fase-16-staging-import",
    status,
    mode,
    environment,
    input: inputSummary,
    dryRun,
    approval,
    backup,
    productionBlocked: guard.productionBlocked,
    connectionVariablePresent: Boolean(env.STAGING_DATABASE_URL?.trim()),
    issues
  };
}
