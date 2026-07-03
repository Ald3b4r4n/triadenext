import type {
  DivergenceOrigin,
  GoNoGo,
  NormalizedCategory,
  NormalizedCoupon,
  NormalizedDryRunData,
  NormalizedInventoryItem,
  NormalizedProduct,
  NormalizedProductImage,
  NormalizedShippingRule,
  ReconciliationReport,
  ReportFormat,
  Severity
} from "@/features/data-dry-run/types";

export type StagingTarget = "staging" | "preview" | "remote-dev";

export type StagingProvider = "neon" | "other";

export type StagingWriteMode = "check" | "upsert" | "reset-and-upsert";

export type StagingEnv = Record<string, string | undefined>;

export type StagingPreflightStatus = "planned" | "pending-input" | "blocked";

export type StagingImportStatus =
  | StagingPreflightStatus
  | "imported"
  | "no-go"
  | "rollback-required"
  | "rolled-back";

export type HumanApprovalDecision = "approved" | "approved-with-exceptions" | "no-go" | "rollback";

export type ImportEntityName =
  | "categories"
  | "products"
  | "productImages"
  | "inventory"
  | "coupons"
  | "shippingRules";

export type StagingImportRecommendedAction =
  | "corrigir-origem"
  | "corrigir-next"
  | "corrigir-mapeamento"
  | "aceitar-excecao"
  | "nova-fase"
  | "rollback";

export interface StagingImportIssue {
  code: string;
  severity: Severity;
  origin: DivergenceOrigin;
  message: string;
  entity?: ImportEntityName | "environment" | "database" | "schema" | "security" | "smoke";
  recommendedAction: StagingImportRecommendedAction;
  blocksImport: boolean;
}

export interface StagingEnvironment {
  target: StagingTarget;
  provider: StagingProvider;
  label: string;
  isProduction: false;
}

export interface StagingImportCliOptions {
  cwd: string;
  target?: string;
  inputDir?: string;
  outputDir?: string;
  mode: StagingWriteMode;
  provider: StagingProvider;
  format: ReportFormat;
  confirmStaging?: string;
  backupConfirmed: boolean;
  allowReset: boolean;
  humanApprovalRef?: string;
  dryRunApprovalRef?: string;
}

export interface HumanApprovalRef {
  required: boolean;
  provided: boolean;
  reference: string | null;
}

export interface BackupSnapshotRef {
  required: boolean;
  confirmed: boolean;
}

export interface ApprovedInputSummary {
  pathLabel: string;
  status: "ready" | "pending-input";
  expectedFiles: Array<{
    entity: ImportEntityName;
    label: string;
    required: boolean;
    status: "present" | "missing";
    matchedFile: string | null;
    candidates: string[];
  }>;
  recordCounts: Partial<Record<ImportEntityName, number>>;
}

export interface DryRunGateResult {
  status: GoNoGo;
  accepted: boolean;
  criticalBlockers: number;
  blockers: number;
  warnings: number;
  report: ReconciliationReport;
  issues: StagingImportIssue[];
}

export interface StagingPreflightResult {
  schemaVersion: 1;
  generatedAt: string;
  feature: "024-fase-16-staging-import";
  status: StagingPreflightStatus;
  mode: StagingWriteMode;
  environment: StagingEnvironment | null;
  input: ApprovedInputSummary | null;
  dryRun: DryRunGateResult | null;
  approval: HumanApprovalRef;
  backup: BackupSnapshotRef;
  productionBlocked: boolean;
  connectionVariablePresent: boolean;
  issues: StagingImportIssue[];
}

export interface StagingImportPlan {
  sourceReport: ReconciliationReport;
  data: NormalizedDryRunData;
  entities: {
    categories: NormalizedCategory[];
    products: NormalizedProduct[];
    productImages: NormalizedProductImage[];
    inventory: NormalizedInventoryItem[];
    coupons: NormalizedCoupon[];
    shippingRules: NormalizedShippingRule[];
  };
  naturalKeys: Record<ImportEntityName, string[]>;
}

export interface EntityWriteSummary {
  entity: ImportEntityName;
  input: number;
  before: number;
  after: number;
  inserted: number;
  updated: number;
  skipped: number;
}

export interface StagingImportDivergence {
  id: string;
  code: string;
  origin: DivergenceOrigin;
  severity: Severity;
  entity: ImportEntityName | "environment" | "database" | "schema" | "security" | "smoke";
  message: string;
  recommendedAction: StagingImportRecommendedAction;
  blocksNextPhase: boolean;
}

export interface EntityUpsertResult {
  entity: ImportEntityName;
  key: string;
  status: "inserted" | "updated" | "skipped" | "conflict";
  message: string;
}

export interface ResetPlan {
  allowed: boolean;
  entities: ImportEntityName[];
  reason: string;
  estimatedKeys: Record<ImportEntityName, number>;
}

export interface ResetExecutionResult {
  status: "skipped" | "executed";
  summary: EntityWriteSummary[];
  message: string;
}

export interface StagingImportExecutionResult {
  schemaVersion: 1;
  generatedAt: string;
  status: StagingImportStatus;
  mode: StagingWriteMode;
  preflight: StagingPreflightResult;
  counts: EntityWriteSummary[];
  divergences: StagingImportDivergence[];
  reset: ResetExecutionResult | null;
  safety: {
    productionConnectionAttempted: false;
    secretsPrinted: false;
    databaseUrlPrinted: false;
    realDeploy: false;
    realMigration: false;
    legacyTouched: false;
  };
}

export interface StagingImportStore {
  countEntities(): Promise<Record<ImportEntityName, number>>;
  runInTransaction<T>(callback: (store: StagingImportStore) => Promise<T>): Promise<T>;
  upsertCategory(category: NormalizedCategory): Promise<EntityUpsertResult>;
  upsertProduct(product: NormalizedProduct): Promise<EntityUpsertResult>;
  ensureProductCategory(productSku: string, categorySlug: string): Promise<EntityUpsertResult>;
  upsertProductImage(image: NormalizedProductImage): Promise<EntityUpsertResult>;
  upsertInventory(item: NormalizedInventoryItem): Promise<EntityUpsertResult>;
  upsertCoupon(coupon: NormalizedCoupon): Promise<EntityUpsertResult>;
  upsertShippingRule(rule: NormalizedShippingRule): Promise<EntityUpsertResult>;
  resetApprovedScope(plan: StagingImportPlan): Promise<ResetExecutionResult>;
}
