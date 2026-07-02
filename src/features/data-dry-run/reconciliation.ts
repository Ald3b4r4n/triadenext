import { createIssue, recordsContainUnsafeValues } from "./safety";
import { issuesToDivergences, isBlockingDivergence } from "./divergences";
import type {
  DryRunEntity,
  NormalizedDryRunData,
  ParsedInputDataset,
  ReconciliationAssetCheck,
  ReconciliationReport
} from "./types";

const countEntities: Array<{ entity: DryRunEntity; label: keyof NormalizedDryRunData }> = [
  { entity: "categories", label: "categories" },
  { entity: "products", label: "products" },
  { entity: "productImages", label: "productImages" },
  { entity: "coupons", label: "coupons" },
  { entity: "shippingRules", label: "shippingRules" }
];

export function reconcileDryRunData(dataset: ParsedInputDataset, data: NormalizedDryRunData): ReconciliationReport {
  const issues = [...data.issues, ...catalogRelationshipIssues(data), ...assetIssues(data), ...shippingCoverageIssues(data)];
  const divergences = issuesToDivergences(issues);
  const blockers = divergences.filter(isBlockingDivergence).length;
  const warnings = divergences.length - blockers;
  const sourceRecords = Object.values(dataset.records).flatMap((records) => records ?? []);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: dataset.source,
    summary: {
      goNoGo: blockers > 0 ? "no-go" : warnings > 0 ? "conditional-go" : "go",
      blockers,
      warnings
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
    ...data.coupons.map((coupon) => ({ domain: "coupons", key: coupon.code, status: "ok" as const })),
    ...data.shippingRules.map((rule) => ({ domain: "shipping", key: rule.ruleCode, status: "ok" as const }))
  ];
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
