import type { StagingSmokeIssue } from "./types";

export interface StagingSmokeDivergence {
  id: string;
  code: string;
  origin: StagingSmokeIssue["origin"];
  severity: StagingSmokeIssue["severity"];
  category: StagingSmokeIssue["category"];
  message: string;
  blocksGoLive: boolean;
}

export function issuesToStagingSmokeDivergences(issues: StagingSmokeIssue[]): StagingSmokeDivergence[] {
  return issues.map((issue, index) => ({
    id: `SMK-DIV-${String(index + 1).padStart(3, "0")}`,
    code: issue.code,
    origin: issue.origin,
    severity: issue.severity,
    category: issue.category,
    message: issue.message,
    blocksGoLive: issue.blocksGoLive
  }));
}
