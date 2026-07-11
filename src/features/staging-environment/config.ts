import type {
  StagingEnvironmentConfig,
  StagingEnvironmentEnv,
  StagingEnvironmentTarget
} from "./types";

const targets: Record<string, StagingEnvironmentTarget> = {
  staging: "staging",
  preview: "preview",
  "remote-dev": "remote-dev",
  "development-remote": "remote-dev"
};

export function resolveStagingEnvironmentConfig(
  options: {
    cwd?: string;
    env?: StagingEnvironmentEnv;
    target?: string;
    allowNetwork?: boolean;
    executeRequested?: boolean;
    confirmStaging?: boolean;
    humanApprovalRef?: string;
    migrationApprovalRef?: string;
    snapshotRef?: string;
    adminApprovalRef?: string;
    smokeApprovalRef?: string;
    migrationsReviewed?: boolean;
  } = {}
): StagingEnvironmentConfig {
  const env = options.env ?? process.env;
  const targetValue =
    options.target ??
    env.STAGING_TARGET ??
    env.STAGING_SMOKE_TARGET ??
    env.VERCEL_ENV;

  return {
    cwd: options.cwd ?? process.cwd(),
    target: resolveStagingEnvironmentTarget(targetValue),
    allowNetwork: options.allowNetwork === true,
    executeRequested: options.executeRequested === true,
    confirmStaging: options.confirmStaging === true,
    humanApprovalProvided: hasText(
      options.humanApprovalRef ?? env.STAGING_HUMAN_APPROVAL
    ),
    migrationApprovalProvided: hasText(
      options.migrationApprovalRef ?? env.STAGING_MIGRATION_APPROVAL
    ),
    snapshotProvided: hasText(options.snapshotRef ?? env.STAGING_SNAPSHOT_REF),
    adminApprovalProvided: hasText(
      options.adminApprovalRef ?? env.STAGING_ADMIN_APPROVAL
    ),
    smokeApprovalProvided: hasText(
      options.smokeApprovalRef ?? env.STAGING_SMOKE_APPROVAL
    ),
    migrationsReviewed:
      options.migrationsReviewed === true ||
      isTruthy(env.STAGING_MIGRATIONS_REVIEWED)
  };
}

export function resolveStagingEnvironmentTarget(
  value: string | undefined
): StagingEnvironmentTarget {
  if (!value) return "unknown";
  return targets[value.trim().toLowerCase()] ?? "unknown";
}

export function hasEnvValue(env: StagingEnvironmentEnv, ...names: string[]) {
  return names.some((name) => hasText(env[name]));
}

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

function isTruthy(value: string | undefined) {
  return /^(1|true|yes|sim)$/i.test(value?.trim() ?? "");
}
