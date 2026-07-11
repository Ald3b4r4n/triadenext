import { evaluateStagingExecutionGate } from "./execution-gates";
import {
  blockingIssue,
  createEnvironmentCheck,
  pendingConfigIssue
} from "./readiness";
import type {
  StagingEnvironmentConfig,
  StagingEnvironmentEnv,
  StagingExecutionGate
} from "./types";

export function evaluateStagingMigrationGate(input: {
  config: StagingEnvironmentConfig;
  env?: StagingEnvironmentEnv;
}): StagingExecutionGate {
  const env = input.env ?? process.env;
  if (!input.config.executeRequested) {
    const issue = pendingConfigIssue({
      code: "MIGRATION_EXECUTION_NOT_REQUESTED",
      category: "migration",
      message:
        "Migration staging não foi armada; check concluído sem conexão remota."
    });
    return {
      action: "migration",
      status: "pending-config",
      allowed: false,
      issues: [issue],
      check: createEnvironmentCheck({
        id: "staging-migration-gate",
        provider: "neon",
        label: "Gate de migration staging",
        status: "pending-config",
        summary: issue.message,
        issues: [issue]
      })
    };
  }
  const baseGate = evaluateStagingExecutionGate({
    action: "migration",
    config: input.config,
    env,
    requiredConfigured: Boolean(env.STAGING_DATABASE_URL?.trim())
  });
  const issues = [...baseGate.issues];
  if (!input.config.snapshotProvided)
    issues.push(
      blockingIssue({
        code: "SNAPSHOT_REQUIRED",
        category: "migration",
        severity: "HIGH",
        message: "Migration staging exige snapshot/restore confirmado."
      })
    );
  if (!input.config.migrationsReviewed)
    issues.push(
      blockingIssue({
        code: "MIGRATIONS_REVIEW_REQUIRED",
        category: "migration",
        severity: "HIGH",
        message: "Migrations `0000` a `0007` precisam de revisão explícita."
      })
    );
  const allowed = baseGate.allowed && issues.length === 0;
  return {
    action: "migration",
    status: allowed ? "passed" : "blocked",
    allowed,
    issues,
    check: createEnvironmentCheck({
      id: "staging-migration-gate",
      provider: "neon",
      label: "Gate de migration staging",
      status: allowed ? "passed" : "blocked",
      summary: allowed
        ? "Migration staging armada com target, revisão, snapshot e aprovação."
        : "Migration staging bloqueada antes de carregar conexão.",
      issues
    })
  };
}
