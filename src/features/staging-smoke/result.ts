import type { StagingSmokeCategory, StagingSmokeCheck, StagingSmokeIssue, StagingSmokeStatus } from "./types";

export function createIssue(input: StagingSmokeIssue): StagingSmokeIssue {
  return input;
}

export function createCheck(input: {
  id: string;
  label: string;
  category: StagingSmokeCategory;
  status: StagingSmokeStatus;
  summary: string;
  issues?: StagingSmokeIssue[];
}): StagingSmokeCheck {
  return {
    id: input.id,
    label: input.label,
    category: input.category,
    status: input.status,
    summary: input.summary,
    issueCodes: input.issues?.map((issue) => issue.code) ?? []
  };
}

export function pendingConfigIssue(input: Omit<StagingSmokeIssue, "severity" | "origin" | "blocksGoLive">): StagingSmokeIssue {
  return {
    ...input,
    severity: "LOW",
    origin: "humana",
    blocksGoLive: false
  };
}

export function pendingInputIssue(input: Omit<StagingSmokeIssue, "severity" | "origin" | "blocksGoLive">): StagingSmokeIssue {
  return {
    ...input,
    severity: "LOW",
    origin: "humana",
    blocksGoLive: false
  };
}

export function blockedIssue(input: Omit<StagingSmokeIssue, "severity" | "blocksGoLive"> & { severity?: StagingSmokeIssue["severity"] }) {
  return {
    ...input,
    severity: input.severity ?? "CRITICAL",
    blocksGoLive: true
  };
}

export function mergeStatus(statuses: StagingSmokeStatus[]): StagingSmokeStatus {
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("failed")) return "failed";
  if (statuses.includes("pending-config")) return "pending-config";
  if (statuses.includes("pending-input")) return "pending-input";
  if (statuses.every((status) => status === "skipped")) return "skipped";
  if (statuses.includes("skipped")) return statuses.includes("passed") ? "passed" : "skipped";
  return "passed";
}
