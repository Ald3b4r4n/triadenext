import type { StagingImportDivergence, StagingImportExecutionResult, StagingPreflightResult } from "./types";

export interface PreImportReport {
  schemaVersion: 1;
  generatedAt: string;
  feature: "024-fase-16-staging-import";
  target: {
    kind: string | null;
    provider: string | null;
    productionBlocked: boolean;
    approvedByHuman: boolean;
  };
  source: {
    inputDir: string | null;
    dryRunStatus: string | null;
    criticalBlockers: number | null;
  };
  safety: {
    secretsPrinted: false;
    databaseUrlPrinted: false;
    legacyTouched: false;
    productionConnectionAttempted: false;
  };
  writePlan: {
    mode: string;
    backupConfirmed: boolean;
    resetRequested: boolean;
    humanApprovalRef: string | null;
  };
  result: {
    status: string;
    blockers: StagingImportDivergence[];
  };
}

export interface PostImportReport {
  schemaVersion: 1;
  generatedAt: string;
  feature: "024-fase-16-staging-import";
  target: {
    kind: string | null;
    provider: string | null;
  };
  summary: {
    status: string;
    mode: string;
    entitiesWritten: number;
    blockers: number;
    warnings: number;
  };
  counts: StagingImportExecutionResult["counts"];
  divergences: StagingImportDivergence[];
  safety: StagingImportExecutionResult["safety"];
}

export interface HumanApprovalSummary {
  schemaVersion: 1;
  generatedAt: string;
  feature: "024-fase-16-staging-import";
  status: "approved" | "approved-with-exceptions" | "no-go" | "rollback" | "pending-human";
  target: string | null;
  preflightStatus: StagingPreflightResult["status"];
  importStatus: StagingImportExecutionResult["status"];
  backupConfirmed: boolean;
  rollbackDocumented: boolean;
  divergences: {
    blockers: number;
    warnings: number;
  };
}
