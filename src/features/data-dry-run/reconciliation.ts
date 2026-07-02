import { createIssue, recordsContainUnsafeValues } from "./safety";
import { issuesToDivergences, isBlockingDivergence } from "./divergences";
import type {
  DryRunEntity,
  DryRunExpectedFile,
  NormalizedDryRunData,
  ParsedInputDataset,
  ReconciliationAssetCheck,
  ReconciliationDivergence,
  ReconciliationReport,
  SourceMetadata
} from "./types";

const countEntities: Array<{ entity: DryRunEntity; label: keyof NormalizedDryRunData }> = [
  { entity: "categories", label: "categories" },
  { entity: "products", label: "products" },
  { entity: "productImages", label: "productImages" },
  { entity: "inventory", label: "inventory" },
  { entity: "coupons", label: "coupons" },
  { entity: "shippingRules", label: "shippingRules" }
];

export function reconcileDryRunData(dataset: ParsedInputDataset, data: NormalizedDryRunData): ReconciliationReport {
  const issues = [
    ...data.issues,
    ...catalogRelationshipIssues(data),
    ...inventoryRelationshipIssues(data),
    ...inventoryPublicationIssues(data),
    ...assetIssues(data),
    ...shippingCoverageIssues(data)
  ];
  const divergences = issuesToDivergences(issues);
  const blockers = divergences.filter(isBlockingDivergence).length;
  const warnings = divergences.length - blockers;
  const sourceRecords = Object.values(dataset.records).flatMap((records) => records ?? []);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: dataset.source,
    summary: {
      goNoGo: blockers > 0 ? "no-go" : "go",
      blockers,
      warnings,
      byOrigin: summarizeDivergenceOrigins(divergences)
    },
    counts: countEntities.map(({ entity, label }) => {
      const source = dataset.records[entity]?.length ?? 0;
      const normalized = Array.isArray(data[label]) ? data[label].length : 0;
      return {
        entity,
        source,
        normalized,
        difference: normalized - source,
        note: normalized === source ? "contagem reconciliada" : "diferenca exige revisao"
      };
    }),
    keys: buildKeyChecks(data),
    money: [
      ...data.products.map((product) => ({
        domain: "products" as const,
        entityKey: product.sku,
        amountCents: product.priceCents,
        status: product.priceCents > 0 ? ("ok" as const) : ("invalid" as const)
      })),
      ...data.coupons.map((coupon) => ({
        domain: "coupons" as const,
        entityKey: coupon.code,
        amountCents: coupon.value,
        status: coupon.isActive && coupon.type !== "free_shipping" && coupon.value <= 0 ? ("invalid" as const) : ("ok" as const)
      })),
      ...data.shippingRules.map((rule) => ({
        domain: "shipping" as const,
        entityKey: rule.ruleCode,
        amountCents: rule.priceCents,
        status: rule.isActive && rule.priceCents <= 0 ? ("invalid" as const) : ("ok" as const)
      }))
    ],
    assets: buildAssetChecks(data),
    shipping: data.shippingRules.map((rule) => ({
      ruleCode: rule.ruleCode,
      coverage: rule.uf ?? `${rule.postalCodeStart ?? "?"}-${rule.postalCodeEnd ?? "?"}`,
      priceCents: rule.priceCents,
      status: rule.isActive && rule.priceCents > 0 ? "ok" : "invalid"
    })),
    coupons: data.coupons.map((coupon) => ({
      code: coupon.code,
      type: coupon.type,
      isActive: coupon.isActive,
      status: coupon.isActive && coupon.type !== "free_shipping" && coupon.value <= 0 ? "invalid" : "ok"
    })),
    divergences,
    privacy: {
      secretsDetected: recordsContainUnsafeValues(sourceRecords),
      rawPersonalDataInReport: false
    }
  };
}

export function createPendingInputReport(source: SourceMetadata, expectedFiles: DryRunExpectedFile[]): ReconciliationReport {
  const issues = expectedFiles
    .filter((file) => file.required && file.status === "missing")
    .map((file) =>
      createIssue({
        code: "INPUT_PENDING",
        entity: file.entity,
        severity: "LOW",
        goLiveImpact: "decisao-humana",
        message: `Arquivo aprovado pendente para ${file.label}.`,
        field: file.candidates.join(" ou "),
        recommendedAction: "nova-fase"
      })
    );
  const divergences = issuesToDivergences(issues);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source,
    summary: {
      goNoGo: "pending-input",
      blockers: 0,
      warnings: divergences.length,
      byOrigin: summarizeDivergenceOrigins(divergences)
    },
    counts: countEntities.map(({ entity }) => ({
      entity,
      source: 0,
      normalized: 0,
      difference: 0,
      note: "entrada aprovada pendente"
    })),
    keys: [],
    money: [],
    assets: [],
    shipping: [],
    coupons: [],
    divergences,
    privacy: {
      secretsDetected: false,
      rawPersonalDataInReport: false
    }
  };
}

function catalogRelationshipIssues(data: NormalizedDryRunData) {
  const issues = [];
  const categorySlugs = new Set(data.categories.map((category) => category.slug));

  for (const product of data.products) {
    if (!categorySlugs.has(product.categorySlug)) {
      issues.push(
        createIssue({
          code: "UNKNOWN_REFERENCE",
          entity: "products",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Produto referencia categoria ausente.",
          field: "category_slug",
          entityKey: product.sku,
          recommendedAction: "corrigir-origem"
        })
      );
    }
  }

  return issues;
}

function assetIssues(data: NormalizedDryRunData) {
  const issues = [];
  const productSkus = new Set(data.products.map((product) => product.sku));
  const publishedProducts = data.products.filter((product) => product.status === "published");
  const imagesByProduct = groupImages(data);

  for (const image of data.productImages) {
    if (!productSkus.has(image.productSku)) {
      issues.push(
        createIssue({
          code: "UNKNOWN_REFERENCE",
          entity: "productImages",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Imagem referencia produto ausente.",
          field: "product_sku",
          entityKey: image.productSku,
          recommendedAction: "corrigir-origem"
        })
      );
    }
  }

  for (const product of publishedProducts) {
    const images = imagesByProduct.get(product.sku) ?? [];
    const hasCover = images.some((image) => image.isCover);
    const hasFallback = images.some((image) => image.fallbackApproved);

    if (images.length === 0 || (!hasCover && !hasFallback)) {
      issues.push(
        createIssue({
          code: "IMAGE_MISSING",
          entity: "productImages",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Produto publicado precisa de capa ou fallback aprovado.",
          field: "reference",
          entityKey: product.sku,
          recommendedAction: "corrigir-origem"
        })
      );
    }
  }

  return issues;
}

function inventoryRelationshipIssues(data: NormalizedDryRunData) {
  const issues = [];
  const productSkus = new Set(data.products.map((product) => product.sku));

  for (const item of data.inventory) {
    if (!productSkus.has(item.productSku)) {
      issues.push(
        createIssue({
          code: "UNKNOWN_REFERENCE",
          entity: "inventory",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Inventario referencia produto ausente.",
          field: "product_sku",
          entityKey: item.productSku,
          recommendedAction: "corrigir-origem"
        })
      );
    }
  }

  return issues;
}

function inventoryPublicationIssues(data: NormalizedDryRunData) {
  if (data.inventory.length === 0) {
    return [];
  }

  return data.products
    .filter((product) => product.status === "published" && product.stockQuantity <= 0)
    .map((product) =>
      createIssue({
        code: "INVALID_VALUE",
        entity: "inventory",
        severity: "HIGH",
        goLiveImpact: "bloqueador",
        message: "Produto publicado precisa reconciliar estoque positivo no inventario.",
        field: "stock_quantity",
        entityKey: product.sku,
        recommendedAction: "corrigir-origem"
      })
    );
}

function shippingCoverageIssues(data: NormalizedDryRunData) {
  if (data.shippingRules.some((rule) => rule.isActive && rule.priceCents > 0)) {
    return [];
  }

  return [
    createIssue({
      code: "SHIPPING_COVERAGE_MISSING",
      entity: "shippingRules",
      severity: "HIGH",
      goLiveImpact: "bloqueador",
      message: "Frete minimo precisa ter pelo menos uma regra ativa com preco positivo.",
      field: "shipping_rules",
      recommendedAction: "corrigir-origem"
    })
  ];
}

function buildKeyChecks(data: NormalizedDryRunData) {
  return [
    ...data.categories.map((category) => ({ domain: "categories", key: category.slug, status: "ok" as const })),
    ...data.products.flatMap((product) => [
      { domain: "products", key: product.sku, status: "ok" as const },
      { domain: "products", key: product.slug, status: "ok" as const }
    ]),
    ...data.inventory.map((item) => ({ domain: "inventory", key: item.productSku, status: "ok" as const })),
    ...data.coupons.map((coupon) => ({ domain: "coupons", key: coupon.code, status: "ok" as const })),
    ...data.shippingRules.map((rule) => ({ domain: "shipping", key: rule.ruleCode, status: "ok" as const }))
  ];
}

function summarizeDivergenceOrigins(divergences: ReconciliationDivergence[]) {
  return divergences.reduce(
    (summary, divergence) => {
      summary[divergence.origin] += 1;
      return summary;
    },
    { dados: 0, next: 0, mapeamento: 0, humana: 0 }
  );
}

function buildAssetChecks(data: NormalizedDryRunData): ReconciliationAssetCheck[] {
  const imagesByProduct = groupImages(data);
  const productSkus = new Set(data.products.map((product) => product.sku));

  return [
    ...data.products
      .filter((product) => product.status === "published")
      .map((product) => {
        const images = imagesByProduct.get(product.sku) ?? [];
        const hasCover = images.some((image) => image.isCover);
        const fallbackApproved = images.some((image) => image.fallbackApproved);
        return {
          productSku: product.sku,
          imageReferences: images.length,
          hasCover,
          fallbackApproved,
          status: images.length > 0 && (hasCover || fallbackApproved) ? ("ok" as const) : ("missing" as const)
        };
      }),
    ...data.productImages
      .filter((image) => !productSkus.has(image.productSku))
      .map((image) => ({
        productSku: image.productSku,
        imageReferences: 1,
        hasCover: image.isCover,
        fallbackApproved: image.fallbackApproved,
        status: "unknown-product" as const
      }))
  ];
}

function groupImages(data: NormalizedDryRunData) {
  const imagesByProduct = new Map<string, typeof data.productImages>();
  for (const image of data.productImages) {
    const images = imagesByProduct.get(image.productSku) ?? [];
    images.push(image);
    imagesByProduct.set(image.productSku, images);
  }
  return imagesByProduct;
}
