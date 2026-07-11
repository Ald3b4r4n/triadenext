import { runStagingSmokeReadiness } from "@/features/staging-smoke/report-orchestrator";
import type { StagingSmokeExecutionOptions } from "@/features/staging-smoke/storefront-smoke";
import { resolveStagingEnvironmentConfig } from "./config";
import { evaluateStagingExecutionGate } from "./execution-gates";
import type { StagingEnvironmentEnv } from "./types";

export async function runApprovedStagingSmoke(
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
  const config = resolveStagingEnvironmentConfig({ ...options, env });
  const gate = evaluateStagingExecutionGate({
    action: "smoke",
    config,
    env,
    requiredConfigured: Boolean(
      env.STAGING_SMOKE_URL?.trim() && config.allowNetwork
    )
  });
  const result = await runStagingSmokeReadiness({
    cwd: options.cwd,
    env,
    target: options.target,
    allowNetwork: gate.allowed,
    humanApprovalRef: gate.allowed ? "provided" : undefined,
    fetcher: options.fetcher
  });
  return { gate, result };
}
