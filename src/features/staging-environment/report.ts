import type {
  StagingEnvironmentCheck,
  StagingEnvironmentIssue,
  StagingEnvironmentSafety,
  StagingEnvironmentStatus,
  StagingGoNoGo
} from "./types";
export interface StagingEnvironmentReport {
  schemaVersion: 1;
  executionId: string;
  generatedAt: string;
  feature: "026-fase-18-staging-environment";
  target: string;
  status: StagingEnvironmentStatus;
  decision: StagingGoNoGo;
  summary: {
    passed: number;
    pendingConfig: number;
    pendingInput: number;
    blocked: number;
    failed: number;
  };
  sections: Array<{
    id: string;
    label: string;
    status: StagingEnvironmentStatus;
    summary: string;
  }>;
  issues: StagingEnvironmentIssue[];
  humanApprovalRequired: true;
  rollback: { deployment: "documented"; database: "pending" | "confirmed" };
  nextActions: string[];
  safety: StagingEnvironmentSafety;
}
export function buildStagingEnvironmentReport(input: {
  target: string;
  status: StagingEnvironmentStatus;
  decision: StagingGoNoGo;
  checks: StagingEnvironmentCheck[];
  issues: StagingEnvironmentIssue[];
  nextActions: string[];
  safety: StagingEnvironmentSafety;
  databaseRollbackConfirmed?: boolean;
}): StagingEnvironmentReport {
  const count = (status: StagingEnvironmentStatus) =>
    input.checks.filter((check) => check.status === status).length;
  return {
    schemaVersion: 1,
    executionId: `staging-environment-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    feature: "026-fase-18-staging-environment",
    target: input.target,
    status: input.status,
    decision: input.decision,
    summary: {
      passed: count("passed"),
      pendingConfig: count("pending-config"),
      pendingInput: count("pending-input"),
      blocked: count("blocked"),
      failed: count("failed")
    },
    sections: input.checks.map((check) => ({
      id: check.id,
      label: check.label,
      status: check.status,
      summary: check.summary
    })),
    issues: input.issues,
    humanApprovalRequired: true,
    rollback: {
      deployment: "documented",
      database: input.databaseRollbackConfirmed ? "confirmed" : "pending"
    },
    nextActions: input.nextActions,
    safety: input.safety
  };
}
