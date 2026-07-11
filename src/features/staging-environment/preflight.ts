import { resolveStagingEnvironmentConfig } from "./config";
import { inspectStagingEnvironmentVariables } from "./env-readiness";
import { inspectProviderReadiness } from "./provider-readiness";
import { combineEnvironmentStatus } from "./readiness";
import { guardStagingEnvironment } from "./production-guard";
import type {
  StagingEnvironmentEnv,
  StagingEnvironmentInventory,
  StagingEnvironmentSafety
} from "./types";

const safeState: StagingEnvironmentSafety = {
  secretsPrinted: false,
  urlsPrinted: false,
  databaseConnected: false,
  remoteMigrationExecuted: false,
  remoteBootstrapExecuted: false,
  deployExecuted: false,
  stripeLiveUsed: false,
  legacyTouched: false
};

export function runStagingEnvironmentPreflight(
  options: Parameters<typeof resolveStagingEnvironmentConfig>[0] & {
    env?: StagingEnvironmentEnv;
  } = {}
): StagingEnvironmentInventory {
  const env = options.env ?? process.env;
  const config = resolveStagingEnvironmentConfig({ ...options, env });
  const envReadiness = inspectStagingEnvironmentVariables(env);
  const providers = inspectProviderReadiness({ env, config });
  const productionGuard = guardStagingEnvironment({ config, env });
  const checks = [envReadiness.check, ...providers.checks];
  const issues = [
    ...envReadiness.issues,
    ...providers.issues,
    ...productionGuard.issues
  ];
  const status = combineEnvironmentStatus(checks, issues);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    feature: "026-fase-18-staging-environment",
    target: config.target,
    status,
    goNoGo: "no-go",
    checks,
    issues,
    nextActions: Array.from(
      new Set(checks.flatMap((check) => check.nextActions))
    ),
    safety: safeState
  };
}
