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
export const STAGING_MASTER_EMAIL = "rafasouzacruz@gmail.com";

export function evaluateAdminBootstrapGate(input: {
  config: StagingEnvironmentConfig;
  env?: StagingEnvironmentEnv;
}): StagingExecutionGate {
  const env = input.env ?? process.env;
  if (!input.config.executeRequested) {
    const issue = pendingConfigIssue({
      code: "ADMIN_BOOTSTRAP_NOT_REQUESTED",
      category: "auth",
      message: "Bootstrap staging não foi armado; nenhuma conexão foi iniciada."
    });
    return {
      action: "admin-bootstrap",
      status: "pending-config",
      allowed: false,
      issues: [issue],
      check: createEnvironmentCheck({
        id: "admin-bootstrap-gate",
        provider: "auth",
        label: "Gate de bootstrap master",
        status: "pending-config",
        summary: issue.message,
        issues: [issue]
      })
    };
  }
  const allowlist = (env.ADMIN_MASTER_EMAILS ?? "")
    .split(/[;,\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const configured = Boolean(
    env.STAGING_DATABASE_URL?.trim() &&
    env.BETTER_AUTH_SECRET?.trim() &&
    env.BETTER_AUTH_URL?.trim() &&
    allowlist.includes(STAGING_MASTER_EMAIL)
  );
  const baseGate = evaluateStagingExecutionGate({
    action: "admin-bootstrap",
    config: input.config,
    env,
    requiredConfigured: configured
  });
  const issues = [...baseGate.issues];
  if (!allowlist.includes(STAGING_MASTER_EMAIL))
    issues.push(
      blockingIssue({
        code: "MASTER_ALLOWLIST_REQUIRED",
        category: "auth",
        severity: "HIGH",
        message: "Administrador master esperado não está na allowlist staging."
      })
    );
  const allowed = baseGate.allowed && issues.length === 0;
  return {
    action: "admin-bootstrap",
    status: allowed ? "passed" : "blocked",
    allowed,
    issues,
    check: createEnvironmentCheck({
      id: "admin-bootstrap-gate",
      provider: "auth",
      label: "Gate de bootstrap master",
      status: allowed ? "passed" : "blocked",
      summary: allowed
        ? "Bootstrap master staging possui configuração e aprovação."
        : "Bootstrap master bloqueado antes de carregar banco/auth.",
      issues
    })
  };
}
