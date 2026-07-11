export type StagingEnvironmentStatus =
  | "passed"
  | "pending-config"
  | "pending-input"
  | "blocked"
  | "failed"
  | "skipped";

export type StagingEnvironmentTarget =
  | "staging"
  | "preview"
  | "remote-dev"
  | "unknown";

export type StagingProvider =
  | "vercel"
  | "neon"
  | "stripe"
  | "auth"
  | "approved-input"
  | "environment";

export type StagingAction = "migration" | "admin-bootstrap" | "smoke";
export type StagingGoNoGo = "go" | "no-go";
export type StagingEnvironmentEnv = Record<string, string | undefined>;

export interface StagingEnvironmentConfig {
  cwd: string;
  target: StagingEnvironmentTarget;
  allowNetwork: boolean;
  executeRequested: boolean;
  confirmStaging: boolean;
  humanApprovalProvided: boolean;
  migrationApprovalProvided: boolean;
  snapshotProvided: boolean;
  adminApprovalProvided: boolean;
  smokeApprovalProvided: boolean;
  migrationsReviewed: boolean;
}

export interface StagingEnvironmentCheck {
  id: string;
  provider: StagingProvider;
  label: string;
  status: StagingEnvironmentStatus;
  configured: boolean;
  required: boolean;
  summary: string;
  issueCodes: string[];
  nextActions: string[];
}

export interface StagingEnvironmentIssue {
  code: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: StagingProvider | "security" | "migration" | "reporting";
  message: string;
  blocksExecution: boolean;
}

export interface StagingEnvironmentInventory {
  schemaVersion: 1;
  generatedAt: string;
  feature: "026-fase-18-staging-environment";
  target: StagingEnvironmentTarget;
  status: StagingEnvironmentStatus;
  goNoGo: StagingGoNoGo;
  checks: StagingEnvironmentCheck[];
  issues: StagingEnvironmentIssue[];
  nextActions: string[];
  safety: StagingEnvironmentSafety;
}

export interface StagingEnvironmentSafety {
  secretsPrinted: false;
  urlsPrinted: false;
  databaseConnected: false;
  remoteMigrationExecuted: false;
  remoteBootstrapExecuted: false;
  deployExecuted: false;
  stripeLiveUsed: false;
  legacyTouched: false;
}

export interface StagingExecutionGate {
  action: StagingAction;
  status: "passed" | "pending-config" | "blocked";
  allowed: boolean;
  issues: StagingEnvironmentIssue[];
  check: StagingEnvironmentCheck;
}
