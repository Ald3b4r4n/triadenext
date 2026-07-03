export type StagingSmokeStatus = "passed" | "pending-config" | "pending-input" | "blocked" | "failed" | "skipped";

export type StagingSmokeTargetKind = "staging" | "preview" | "remote-dev" | "unknown";

export type StagingSmokeGoNoGo = "go" | "no-go" | "pending-config" | "pending-input";

export type StagingSmokeSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type StagingSmokeDivergenceOrigin = "dados" | "next" | "mapeamento" | "humana";

export type StagingSmokeCategory =
  | "environment"
  | "security"
  | "database"
  | "migration"
  | "stripe"
  | "webhook"
  | "storefront"
  | "catalog"
  | "cart"
  | "checkout"
  | "payment"
  | "orders"
  | "admin"
  | "notifications"
  | "import-staging"
  | "reporting";

export interface StagingSmokeEnv {
  [key: string]: string | undefined;
}

export interface StagingSmokeConfig {
  cwd: string;
  target: StagingSmokeTargetKind;
  url: string | null;
  urlSource: string | null;
  importSmokeUrl: string | null;
  importSmokeUrlSource: string | null;
  approvedInputDir: string;
  outputDir: string;
  allowNetwork: boolean;
  humanApprovalRef: string | null;
  migrationApprovalRef: string | null;
  snapshotRef: string | null;
}

export interface StagingSmokeIssue {
  code: string;
  severity: StagingSmokeSeverity;
  origin: StagingSmokeDivergenceOrigin;
  category: StagingSmokeCategory;
  message: string;
  blocksGoLive: boolean;
}

export interface StagingSmokeCheck {
  id: string;
  label: string;
  category: StagingSmokeCategory;
  status: StagingSmokeStatus;
  summary: string;
  issueCodes: string[];
}

export interface StagingSmokeTarget {
  kind: StagingSmokeTargetKind;
  url: URL;
  source: string;
}

export interface ApprovedStagingSmokeInput {
  status: "ready" | "pending-input";
  pathLabel: string;
  expectedFiles: Array<{
    label: string;
    required: boolean;
    status: "present" | "missing";
    matchedFile: string | null;
    candidates: string[];
  }>;
}

export interface StagingSmokePreflight {
  schemaVersion: 1;
  generatedAt: string;
  feature: "025-fase-17-staging-smoke";
  status: StagingSmokeStatus;
  target: StagingSmokeTarget | null;
  config: Omit<StagingSmokeConfig, "url" | "importSmokeUrl"> & {
    urlPresent: boolean;
    importSmokeUrlPresent: boolean;
  };
  checks: StagingSmokeCheck[];
  issues: StagingSmokeIssue[];
  approvedInput: ApprovedStagingSmokeInput;
  safety: StagingSmokeSafety;
}

export interface StagingSmokeSafety {
  secretsPrinted: false;
  databaseUrlPrinted: false;
  productionConnectionAttempted: false;
  realDeploy: false;
  realMigration: false;
  stripeLiveModeUsed: false;
  legacyTouched: false;
}

export interface StagingSmokeRunResult {
  schemaVersion: 1;
  generatedAt: string;
  feature: "025-fase-17-staging-smoke";
  status: StagingSmokeStatus;
  goNoGo: StagingSmokeGoNoGo;
  preflight: StagingSmokePreflight;
  checks: StagingSmokeCheck[];
  issues: StagingSmokeIssue[];
  safety: StagingSmokeSafety;
  humanApprovalRequired: boolean;
}

export interface StagingSmokeReport {
  schemaVersion: 1;
  runId: string;
  startedAt: string;
  feature: "025-fase-17-staging-smoke";
  targetKind: StagingSmokeTargetKind;
  overallStatus: StagingSmokeStatus;
  goNoGo: StagingSmokeGoNoGo;
  checks: StagingSmokeCheck[];
  issues: StagingSmokeIssue[];
  humanApprovalRequired: boolean;
  secretsPrinted: false;
  safety: StagingSmokeSafety;
}
