import { normalizePostalCode, normalizeUf } from "@/features/shipping/domain";
import {
  collectIssue,
  duplicateIssue,
  parseBooleanField,
  parseIntegerField,
  requiredText
} from "./common";
import { createIssue } from "../safety";
import type {
  NormalizationResult,
  NormalizedShippingRule,
  ParsedRecord
} from "../types";

export function normalizeShippingRules(
  records: ParsedRecord[]
): NormalizationResult<NormalizedShippingRule> {
  const normalized: NormalizedShippingRule[] = [];
  const issues: NormalizationResult<NormalizedShippingRule>["issues"] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const ruleCode = requiredText(
      record,
      "rule_code",
      "shippingRules",
      "Codigo da regra de frete"
    );
    const name = requiredText(
      record,
      "name",
      "shippingRules",
      "Nome da regra de frete"
    );
    const price = parseIntegerField(
      record,
      "price_cents",
      "shippingRules",
      "Preço de frete em centavos",
      {
        required: true,
        min: 0
      }
    );
    const days = parseIntegerField(
      record,
      "estimated_days",
      "shippingRules",
      "Prazo estimado",
      {
        required: true,
        min: 1
      }
    );
    const priority = parseIntegerField(
      record,
      "priority",
      "shippingRules",
      "Prioridade",
      { defaultValue: 0 }
    );

    for (const issue of [
      ruleCode.issue,
      name.issue,
      price.issue,
      days.issue,
      priority.issue
    ]) {
      collectIssue(issues, issue);
    }

    const isActive = parseBooleanField(record, "is_active", true);
    const uf = normalizeUf(String(record.values.uf ?? ""));
    const postalCodeStart = normalizePostalRange(
      record,
      "postal_code_start",
      ruleCode.value,
      issues
    );
    const postalCodeEnd = normalizePostalRange(
      record,
      "postal_code_end",
      ruleCode.value,
      issues
    );

    if (ruleCode.value && seen.has(ruleCode.value)) {
      issues.push(duplicateIssue("shippingRules", "rule_code", ruleCode.value));
    }
    seen.add(ruleCode.value);

    if (isActive && !uf && (!postalCodeStart || !postalCodeEnd)) {
      issues.push(
        createIssue({
          code: "INVALID_VALUE",
          entity: "shippingRules",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message:
            "Regra de frete ativa precisa de UF ou faixa de CEP completa.",
          field: "uf",
          row: record.lineNumber,
          entityKey: ruleCode.value,
          recommendedAction: "corrigir-origem"
        })
      );
    }

    if (isActive && price.value <= 0) {
      issues.push(
        createIssue({
          code: "INVALID_VALUE",
          entity: "shippingRules",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Regra de frete ativa precisa ter preço positivo.",
          field: "price_cents",
          row: record.lineNumber,
          entityKey: ruleCode.value,
          recommendedAction: "corrigir-origem"
        })
      );
    }

    normalized.push({
      ruleCode: ruleCode.value,
      name: name.value,
      uf,
      postalCodeStart,
      postalCodeEnd,
      priceCents: price.value,
      estimatedDays: days.value,
      isActive,
      priority: priority.value
    });
  }

  return { records: normalized, issues };
}

function normalizePostalRange(
  record: ParsedRecord,
  field: "postal_code_start" | "postal_code_end",
  ruleCode: string,
  issues: NormalizationResult<NormalizedShippingRule>["issues"]
) {
  const value = String(record.values[field] ?? "").trim();
  if (!value) {
    return null;
  }

  try {
    return normalizePostalCode(value);
  } catch {
    issues.push(
      createIssue({
        code: "INVALID_VALUE",
        entity: "shippingRules",
        severity: "HIGH",
        goLiveImpact: "bloqueador",
        message: "Faixa de CEP precisa ter 8 digitos.",
        field,
        row: record.lineNumber,
        entityKey: ruleCode,
        recommendedAction: "corrigir-origem"
      })
    );
    return null;
  }
}
