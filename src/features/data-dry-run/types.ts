export type DryRunEntity = "categories" | "products" | "productImages" | "inventory" | "coupons" | "shippingRules";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type GoLiveImpact = "bloqueador" | "decisao-humana" | "pos-go-live" | "fora-de-escopo";

export type GoNoGo = "pending-input" | "go" | "no-go";

export type DryRunInputStatus = "ready" | "pending-input";

export type ReportFormat = "json" | "markdown" | "both";

export type DivergenceOrigin = "dados" | "next" | "mapeamento" | "humana";

export interface DryRunExpectedFile {
  entity: DryRunEntity;
  label: string;
  required: boolean;
  candidates: string[];
  matchedFile: string | null;
  status: "present" | "missing";
}

export interface SourceMetadata {
  type: "local-files";
  pathLabel: string;
  approvedBy: "manual";
  containsSensitiveData: boolean;
  executionName?: string;
  inputStatus?: DryRunInputStatus;
  expectedFiles?: DryRunExpectedFile[];
}

export interface ParsedRecord {
  file: string;
  lineNumber: number;
  values: Record<string, unknown>;
}

export interface DryRunIssue {
  code: string;
  entity?: DryRunEntity;
  severity: Severity;
  goLiveImpact: GoLiveImpact;
  message: string;
  field?: string;
  row?: number;
  entityKey?: string;
  recommendedAction: "corrigir-origem" | "corrigir-mapeamento" | "aceitar-excecao" | "nova-fase";
}

export interface ParsedInputDataset {
  source: SourceMetadata;
  records: Partial<Record<DryRunEntity, ParsedRecord[]>>;
  issues: DryRunIssue[];
}

export interface NormalizationResult<T> {
  records: T[];
  issues: DryRunIssue[];
}

export interface NormalizedCategory {
  name: string;
  slug: string;
  parentSlug: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface NormalizedProduct {
  sku: string;
  slug: string;
  name: string;
  categorySlug: string;
  priceCents: number;
  stockQuantity: number;
  status: "draft" | "published" | "inactive";
  publishedAt: string | null;
  description: string | null;
  brand: string | null;
}

export interface NormalizedProductImage {
  productSku: string;
  reference: string;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
  fallbackApproved: boolean;
}

export interface NormalizedInventoryItem {
  productSku: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  updatedAt: string | null;
}

export interface NormalizedCoupon {
  code: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  maxUses: number | null;
  usedCount: number;
  minimumSubtotalCents: number | null;
  isActive: boolean;
}

export interface NormalizedShippingRule {
  ruleCode: string;
  name: string;
  uf: string | null;
  postalCodeStart: string | null;
  postalCodeEnd: string | null;
  priceCents: number;
  estimatedDays: number;
  isActive: boolean;
  priority: number;
}

export interface NormalizedDryRunData {
  categories: NormalizedCategory[];
  products: NormalizedProduct[];
  productImages: NormalizedProductImage[];
  inventory: NormalizedInventoryItem[];
  coupons: NormalizedCoupon[];
  shippingRules: NormalizedShippingRule[];
  issues: DryRunIssue[];
}

export interface ReconciliationCount {
  entity: DryRunEntity;
  source: number;
  normalized: number;
  difference: number;
  note: string;
}

export interface ReconciliationKeyCheck {
  domain: string;
  key: string;
  status: "ok" | "missing" | "duplicate" | "unknown-reference";
}

export interface ReconciliationMoneyCheck {
  domain: "products" | "coupons" | "shipping";
  entityKey: string;
  amountCents: number;
  status: "ok" | "invalid";
}

export interface ReconciliationAssetCheck {
  productSku: string;
  imageReferences: number;
  hasCover: boolean;
  fallbackApproved: boolean;
  status: "ok" | "missing" | "unknown-product";
}

export interface ReconciliationDivergence {
  id: string;
  code: string;
  domain: string;
  entityKey: string;
  severity: Severity;
  goLiveImpact: GoLiveImpact;
  message: string;
  recommendedAction: DryRunIssue["recommendedAction"];
  origin: DivergenceOrigin;
  nextFixable: boolean;
}

export interface ReconciliationReport {
  schemaVersion: 1;
  generatedAt: string;
  source: SourceMetadata;
  summary: {
    goNoGo: GoNoGo;
    blockers: number;
    warnings: number;
    byOrigin: Record<DivergenceOrigin, number>;
  };
  counts: ReconciliationCount[];
  keys: ReconciliationKeyCheck[];
  money: ReconciliationMoneyCheck[];
  assets: ReconciliationAssetCheck[];
  shipping: Array<{ ruleCode: string; coverage: string; priceCents: number; status: "ok" | "invalid" }>;
  coupons: Array<{ code: string; type: NormalizedCoupon["type"]; isActive: boolean; status: "ok" | "invalid" }>;
  divergences: ReconciliationDivergence[];
  privacy: {
    secretsDetected: boolean;
    rawPersonalDataInReport: boolean;
  };
}
