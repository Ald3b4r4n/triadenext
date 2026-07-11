import { blockingIssue, createEnvironmentCheck } from "./readiness";
import type {
  StagingAction,
  StagingEnvironmentConfig,
  StagingExecutionGate
} from "./types";

export function checkHumanApproval(
  action: StagingAction,
  config: StagingEnvironmentConfig
): StagingExecutionGate {
  const actionApproved =
    action === "migration"
      ? config.migrationApprovalProvided
      : action === "admin-bootstrap"
        ? config.adminApprovalProvided
        : config.smokeApprovalProvided;
  const allowed =
    config.humanApprovalProvided &&
    actionApproved &&
    config.confirmStaging &&
    config.executeRequested;
  const issues = allowed
    ? []
    : [
        blockingIssue({
          code: "HUMAN_APPROVAL_REQUIRED",
          category: "security",
          severity: "HIGH",
          message: `${action} exige flag, confirmação staging e aprovação humana específicas.`
        })
      ];

  return {
    action,
    status: allowed ? "passed" : "blocked",
    allowed,
    issues,
    check: createEnvironmentCheck({
      id: `${action}-approval`,
      provider: "environment",
      label: `Aprovação ${action}`,
      status: allowed ? "passed" : "blocked",
      summary: allowed
        ? `Gate humano de ${action} foi declarado.`
        : `${action} permanece bloqueado sem aprovação específica.`,
      issues
    })
  };
}
