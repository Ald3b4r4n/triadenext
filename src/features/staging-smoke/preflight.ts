import { inspectApprovedStagingSmokeInput } from "./approved-input";
import { resolveStagingSmokeConfig } from "./config";
import { checkStagingDatabaseReadiness } from "./database-readiness";
import { inspectSafeStagingEnv } from "./env-checks";
import { checkStagingMigrationReadiness } from "./migration-readiness";
import { detectProductionSignals } from "./production-guard";
import { createCheck } from "./result";
import { resolveStagingSmokeTarget } from "./smoke-target";
import { checkStripeTestReadiness } from "./stripe-readiness";
import { classifyOverallStatus } from "./status-policy";
import type { StagingSmokeConfig, StagingSmokeEnv, StagingSmokePreflight } from "./types";

export function runStagingSmokePreflight(options: {
  cwd?: string;
  env?: StagingSmokeEnv;
  target?: string;
  url?: string;
  inputDir?: string;
  outputDir?: string;
  allowNetwork?: boolean;
  humanApprovalRef?: string;
  migrationApprovalRef?: string;
  snapshotRef?: string;
} = {}): StagingSmokePreflight {
  const env = options.env ?? process.env;
  const config = resolveStagingSmokeConfig(options);
  const target = resolveStagingSmokeTarget(config);
  const envChecks = inspectSafeStagingEnv(env);
  const database = checkStagingDatabaseReadiness({ env, humanApprovalRef: config.humanApprovalRef });
  const migration = checkStagingMigrationReadiness({
    migrationApprovalRef: config.migrationApprovalRef,
    snapshotRef: config.snapshotRef
  });
  const stripe = checkStripeTestReadiness(env);
  const approvedInput = inspectApprovedStagingSmokeInput({ cwd: config.cwd, inputDir: config.approvedInputDir });
  const productionGuard = detectProductionSignals({
    config,
    env,
    labels: {
      target: config.target,
      "smoke-url": config.url,
      "import-smoke-url": config.importSmokeUrl,
      "vercel-env": env.VERCEL_ENV,
      "node-env": env.NODE_ENV
    }
  });
  const productionCheck = createCheck({
    id: "production-guard",
    label: "Bloqueio de producao",
    category: "security",
    status: productionGuard.allowed ? "passed" : "blocked",
    summary: productionGuard.allowed
      ? "Nenhum sinal de producao foi aceito para o smoke staging."
      : "Sinal de producao ou secret bloqueou o smoke antes de qualquer acao externa.",
    issues: productionGuard.issues
  });

  const checks = [
    envChecks.check,
    target.check,
    productionCheck,
    database.check,
    migration.check,
    stripe.check,
    approvedInput.check
  ];
  const issues = [
    ...envChecks.issues,
    ...target.issues,
    ...productionGuard.issues,
    ...database.issues,
    ...migration.issues,
    ...stripe.issues,
    ...approvedInput.issues
  ];

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    feature: "025-fase-17-staging-smoke",
    status: classifyOverallStatus(checks.map((check) => check.status), issues),
    target: target.target,
    config: serializeConfig(config),
    checks,
    issues,
    approvedInput: approvedInput.input,
    safety: {
      secretsPrinted: false,
      databaseUrlPrinted: false,
      productionConnectionAttempted: false,
      realDeploy: false,
      realMigration: false,
      stripeLiveModeUsed: false,
      legacyTouched: false
    }
  };
}

function serializeConfig(config: StagingSmokeConfig): StagingSmokePreflight["config"] {
  return {
    cwd: config.cwd,
    target: config.target,
    urlPresent: Boolean(config.url),
    urlSource: config.urlSource,
    importSmokeUrlPresent: Boolean(config.importSmokeUrl),
    importSmokeUrlSource: config.importSmokeUrlSource,
    approvedInputDir: config.approvedInputDir,
    outputDir: config.outputDir,
    allowNetwork: config.allowNetwork,
    humanApprovalRef: config.humanApprovalRef ? "provided" : null,
    migrationApprovalRef: config.migrationApprovalRef ? "provided" : null,
    snapshotRef: config.snapshotRef ? "provided" : null
  };
}
