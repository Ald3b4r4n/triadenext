import type { StagingSmokeCheck, StagingSmokeGoNoGo, StagingSmokeIssue, StagingSmokeReport, StagingSmokeStatus } from "./types";

export interface StagingSmokeSummary {
  status: StagingSmokeStatus;
  goNoGo: StagingSmokeGoNoGo;
  checks: number;
  blockers: number;
  pendingConfig: number;
  pendingInput: number;
  failed: number;
}

export interface StagingSmokeChecklist {
  schemaVersion: 1;
  feature: "025-fase-17-staging-smoke";
  status: "pending-human" | "go" | "no-go" | "pending-config" | "pending-input";
  requiredBeforeGoLive: string[];
  abortCriteria: string[];
}

export type { StagingSmokeCheck, StagingSmokeIssue, StagingSmokeReport };
