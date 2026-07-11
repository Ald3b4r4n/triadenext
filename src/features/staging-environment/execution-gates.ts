import { checkHumanApproval } from "./human-approval";
import { guardStagingEnvironment } from "./production-guard";
import {
  blockingIssue,
  createEnvironmentCheck,
  pendingConfigIssue
} from "./readiness";
import type {
  StagingAction,
  StagingEnvironmentConfig,
  StagingEnvironmentEnv,
  StagingExecutionGate
} from "./types";

export function evaluateStagingExecutionGate(input: {
  action: StagingAction;
  config: StagingEnvironmentConfig;
  env?: StagingEnvironmentEnv;
  requiredConfigured?: boolean;
}): StagingExecutionGate {
  const env = input.env ?? process.env;

  if (!input.config.executeRequested) {
    const issue = pendingConfigIssue({
      code: "REMOTE_EXECUTION_NOT_REQUESTED",
      category: "environment",
      message: `${input.action} não foi armado; check offline concluído sem efeito externo.`
    });
    return {
      action: input.action,
      status: "pending-config",
      allowed: false,
      issues: [issue],
      check: createEnvironmentCheck({
        id: `${input.action}-execution-gate`,
        provider: "environment",
        label: `Gate ${input.action}`,
        status: "pending-config",
        summary: issue.message,
        issues: [issue]
      })
    };
  }

  const environment = guardStagingEnvironment({ config: input.config, env });
  const approval = checkHumanApproval(input.action, input.config);
  const configured = input.requiredConfigured !== false;
  const configIssues = configured
    ? []
    : [
        blockingIssue({
          code: "REMOTE_CONFIG_REQUIRED",
          category: "environment",
          severity: "HIGH",
          message: `${input.action} bloqueado enquanto a configuração staging estiver pendente.`
        })
      ];
  const issues = [...environment.issues, ...approval.issues, ...configIssues];
  const allowed = environment.allowed && approval.allowed && configured;

  return {
    action: input.action,
    status: allowed ? "passed" : "blocked",
    allowed,
    issues,
    check: createEnvironmentCheck({
      id: `${input.action}-execution-gate`,
      provider: "environment",
      label: `Gate ${input.action}`,
      status: allowed ? "passed" : "blocked",
      summary: allowed
        ? `${input.action} pode ser iniciado no alvo staging aprovado.`
        : `${input.action} bloqueado antes de qualquer efeito externo.`,
      issues
    })
  };
}
