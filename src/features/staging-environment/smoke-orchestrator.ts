import { checkAdminLoginSmokeReadiness } from "./admin-login-smoke";
import type { StagingSmokeExecutionOptions } from "@/features/staging-smoke/storefront-smoke";
import { runStagingEnvironmentPreflight } from "./preflight";
import { runApprovedStagingSmoke } from "./staging-smoke-bridge";
import type { StagingEnvironmentEnv } from "./types";

export async function runStagingEnvironmentSmoke(
  options: {
    cwd?: string;
    env?: StagingEnvironmentEnv;
    target?: string;
    allowNetwork?: boolean;
    executeRequested?: boolean;
    confirmStaging?: boolean;
    humanApprovalRef?: string;
    smokeApprovalRef?: string;
    fetcher?: StagingSmokeExecutionOptions["fetcher"];
  } = {}
) {
  const env = options.env ?? process.env;
  const inventory = runStagingEnvironmentPreflight({ ...options, env });
  const admin = checkAdminLoginSmokeReadiness(env);
  const smoke = await runApprovedStagingSmoke({ ...options, env });
  return {
    inventory,
    smoke,
    admin,
    safety: {
      ...inventory.safety,
      databaseConnected: false as const,
      remoteMigrationExecuted: false as const,
      remoteBootstrapExecuted: false as const,
      deployExecuted: false as const,
      legacyTouched: false as const
    }
  };
}
