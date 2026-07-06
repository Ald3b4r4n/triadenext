import { normalizeSlug } from "@/lib/slug";
import {
  collectIssue,
  duplicateIssue,
  optionalText,
  parseCentsField,
  parseIntegerField,
  parseIsoDate,
  requiredText
} from "./common";
import { createIssue } from "../safety";
import type {
  NormalizationResult,
  NormalizedProduct,
  ParsedRecord
} from "../types";

const productStatuses = new Set(["draft", "published", "inactive"]);

export interface NormalizeProductsOptions {
  requireStockQuantity?: boolean;
  validatePublishedStock?: boolean;
}

export function normalizeProducts(
  records: ParsedRecord[],
  options: NormalizeProductsOptions = {}
): NormalizationResult<NormalizedProduct> {
  const requireStockQuantity = options.requireStockQuantity ?? true;
  const validatePublishedStock = options.validatePublishedStock ?? true;
  const normalized: NormalizedProduct[] = [];
  const issues: NormalizationResult<NormalizedProduct>["issues"] = [];
  const seenSku = new Set<string>();
  const seenSlug = new Set<string>();

  for (const record of records) {
    const sku = requiredText(record, "sku", "products", "SKU do produto");
    const slugRaw = requiredText(record, "slug", "products", "Slug do produto");
    const name = requiredText(record, "name", "products", "Nome do produto");
    const categorySlug = requiredText(
      record,
      "category_slug",
      "products",
      "Slug da categoria"
    );
    const price = parseCentsField(record, "products", "price_cents", "price");
    const stock = parseIntegerField(
      record,
      "stock_quantity",
      "products",
      "Estoque",
      {
        required: requireStockQuantity,
        min: 0
      }
    );
    const publishedAt = parseIsoDate(record, "published_at", "products");

    for (const issue of [
      sku.issue,
      slugRaw.issue,
      name.issue,
      categorySlug.issue,
      price.issue,
      stock.issue,
      publishedAt.issue
    ]) {
      collectIssue(issues, issue);
    }

    const status = normalizeStatus(record);
    if (!productStatuses.has(status)) {
      issues.push(
        createIssue({
          code: "INVALID_VALUE",
          entity: "products",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message:
            "Status de produto não mapeia para draft, published ou inactive.",
          field: "status",
          row: record.lineNumber,
          entityKey: sku.value,
          recommendedAction: "corrigir-mapeamento"
        })
      );
    }

    const slug = normalizeSlug(slugRaw.value || name.value);
    if (sku.value && seenSku.has(sku.value)) {
      issues.push(duplicateIssue("products", "sku", sku.value));
    }
    if (slug && seenSlug.has(slug)) {
      issues.push(duplicateIssue("products", "slug", slug));
    }
    seenSku.add(sku.value);
    seenSlug.add(slug);

    if (status === "published") {
      if (price.value <= 0) {
        issues.push(
          blockingProductIssue(
            "Preço de produto publicado precisa ser positivo.",
            "price_cents",
            record.lineNumber,
            sku.value
          )
        );
      }
      if (validatePublishedStock && stock.value <= 0) {
        issues.push(
          blockingProductIssue(
            "Produto publicado precisa ter estoque positivo.",
            "stock_quantity",
            record.lineNumber,
            sku.value
          )
        );
      }
      if (!publishedAt.value) {
        issues.push(
          blockingProductIssue(
            "Produto publicado precisa de published_at válido.",
            "published_at",
            record.lineNumber,
            sku.value
          )
        );
      }
    }

    const normalizedStatus: NormalizedProduct["status"] = productStatuses.has(
      status
    )
      ? (status as NormalizedProduct["status"])
      : "draft";

    normalized.push({
      sku: sku.value,
      slug,
      name: name.value,
      categorySlug: normalizeSlug(categorySlug.value),
      priceCents: price.value,
      stockQuantity: stock.value,
      status: normalizedStatus,
      publishedAt: publishedAt.value,
      description: optionalText(record, "description"),
      brand: optionalText(record, "brand")
    });
  }

  return { records: normalized, issues };
}

function normalizeStatus(
  record: ParsedRecord
): NormalizedProduct["status"] | string {
  return String(record.values.status ?? "")
    .trim()
    .toLowerCase();
}

function blockingProductIssue(
  message: string,
  field: string,
  row: number,
  sku: string
) {
  return createIssue({
    code: "INVALID_VALUE",
    entity: "products",
    severity: "HIGH",
    goLiveImpact: "bloqueador",
    message,
    field,
    row,
    entityKey: sku,
    recommendedAction: "corrigir-origem"
  });
}
