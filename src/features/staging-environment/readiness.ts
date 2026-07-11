import type {
  StagingEnvironmentCheck,
  StagingEnvironmentIssue,
  StagingEnvironmentStatus
} from "./types";

export function createEnvironmentCheck(input: {
  id: string;
  provider: StagingEnvironmentCheck["provider"];
  label: string;
  status: StagingEnvironmentStatus;
  summary: string;
  issues?: StagingEnvironmentIssue[];
  nextActions?: string[];
  required?: boolean;
}): StagingEnvironmentCheck {
  return {
    id: input.id,
    provider: input.provider,
    label: input.label,
    status: input.status,
    configured: input.status === "passed",
    required: input.required ?? true,
    summary: input.summary,
    issueCodes: (input.issues ?? []).map((issue) => issue.code),
    nextActions: input.nextActions ?? []
  };
}

export function pendingConfigIssue(input: {
  code: string;
  category: StagingEnvironmentIssue["category"];
  message: string;
  severity?: StagingEnvironmentIssue["severity"];
}): StagingEnvironmentIssue {
  return {
    code: input.code,
    category: input.category,
    message: input.message,
    severity: input.severity ?? "LOW",
    blocksExecution: false
  };
}

export function blockingIssue(input: {
  code: string;
  category: StagingEnvironmentIssue["category"];
  message: string;
  severity?: StagingEnvironmentIssue["severity"];
}): StagingEnvironmentIssue {
  return {
    code: input.code,
    category: input.category,
    message: input.message,
    severity: input.severity ?? "CRITICAL",
    blocksExecution: true
  };
}

export function combineEnvironmentStatus(
  checks: StagingEnvironmentCheck[],
  issues: StagingEnvironmentIssue[] = []
): StagingEnvironmentStatus {
  if (issues.some((issue) => issue.blocksExecution)) return "blocked";
  if (checks.some((check) => check.status === "failed")) return "failed";
  if (checks.some((check) => check.status === "pending-config")) {
    return "pending-config";
  }
  if (checks.some((check) => check.status === "pending-input")) {
    return "pending-input";
  }
  if (
    checks.length > 0 &&
    checks.every((check) => check.status === "skipped")
  ) {
    return "skipped";
  }
  return "passed";
}
