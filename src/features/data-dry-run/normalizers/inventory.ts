import {
  collectIssue,
  duplicateIssue,
  optionalText,
  parseBooleanField,
  parseIntegerField,
  requiredText
} from "./common";
import { createIssue } from "../safety";
import type {
  NormalizationResult,
  NormalizedInventoryItem,
  ParsedRecord
} from "../types";

export function normalizeInventory(
  records: ParsedRecord[]
): NormalizationResult<NormalizedInventoryItem> {
  const normalized: NormalizedInventoryItem[] = [];
  const issues: NormalizationResult<NormalizedInventoryItem>["issues"] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const sku = requiredInventorySku(record);
    const stock = parseIntegerField(
      record,
      "stock_quantity",
      "inventory",
      "Estoque",
      { required: true, min: 0 }
    );
    const reserved = parseIntegerField(
      record,
      "reserved_quantity",
      "inventory",
      "Estoque reservado",
      {
        defaultValue: 0,
        min: 0
      }
    );
    const updatedAt = optionalText(record, "updated_at");

    collectIssue(issues, sku.issue);
    collectIssue(issues, stock.issue);
    collectIssue(issues, reserved.issue);

    if (sku.value && seen.has(sku.value)) {
      issues.push(duplicateIssue("inventory", "product_sku", sku.value));
    }
    seen.add(sku.value);

    if (reserved.value > stock.value) {
      issues.push(
        createIssue({
          code: "INVALID_VALUE",
          entity: "inventory",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Estoque reservado não pode ser maior que estoque total.",
          field: "reserved_quantity",
          row: record.lineNumber,
          entityKey: sku.value,
          recommendedAction: "corrigir-origem"
        })
      );
    }

    const availableQuantity = Math.max(stock.value - reserved.value, 0);

    normalized.push({
      productSku: sku.value,
      stockQuantity: stock.value,
      reservedQuantity: reserved.value,
      availableQuantity,
      isAvailable: parseBooleanField(
        record,
        "is_available",
        availableQuantity > 0
      ),
      updatedAt
    });
  }

  return { records: normalized, issues };
}

function requiredInventorySku(record: ParsedRecord) {
  const productSku = requiredText(
    record,
    "product_sku",
    "inventory",
    "SKU do produto no inventario"
  );
  if (productSku.value) {
    return productSku;
  }

  const sku = requiredText(
    record,
    "sku",
    "inventory",
    "SKU do produto no inventario"
  );
  return {
    value: sku.value,
    issue: sku.issue
  };
}
