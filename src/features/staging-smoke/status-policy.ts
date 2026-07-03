import { mergeStatus } from "./result";
import type { StagingSmokeGoNoGo, StagingSmokeIssue, StagingSmokeStatus } from "./types";

export function classifyOverallStatus(statuses: StagingSmokeStatus[], issues: StagingSmokeIssue[] = []): StagingSmokeStatus {
  if (issues.some((issue) => issue.blocksGoLive)) {
    return "blocked";
  }

  return mergeStatus(statuses);
}

export function classifyGoNoGo(status: StagingSmokeStatus, issues: StagingSmokeIssue[] = []): StagingSmokeGoNoGo {
  if (status === "pending-config") return "pending-config";
  if (status === "pending-input") return "pending-input";
  if (status === "blocked" || status === "failed" || issues.some((issue) => issue.blocksGoLive)) return "no-go";
  return "go";
}
