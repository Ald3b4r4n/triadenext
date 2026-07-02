import { collectIssue, parseBooleanField, parseIntegerField, requiredText } from "./common";
import type { NormalizationResult, NormalizedProductImage, ParsedRecord } from "../types";

export function normalizeProductImages(records: ParsedRecord[]): NormalizationResult<NormalizedProductImage> {
  const normalized: NormalizedProductImage[] = [];
  const issues: NormalizationResult<NormalizedProductImage>["issues"] = [];

  for (const record of records) {
    const productSku = requiredText(record, "product_sku", "productImages", "SKU do produto da imagem");
    const reference = requiredText(record, "reference", "productImages", "Referencia da imagem");
    const sortOrder = parseIntegerField(record, "sort_order", "productImages", "Ordem da imagem", {
      defaultValue: normalized.length + 1,
      min: 0
    });

    collectIssue(issues, productSku.issue);
    collectIssue(issues, reference.issue);
    collectIssue(issues, sortOrder.issue);

    normalized.push({
      productSku: productSku.value,
      reference: reference.value,
      altText: String(record.values.alt_text ?? "").trim() || null,
      sortOrder: sortOrder.value,
      isCover: parseBooleanField(record, "is_cover", false),
      fallbackApproved: parseBooleanField(record, "fallback_approved", false)
    });
  }

  return { records: normalized, issues };
}
