import { normalizeCouponCode } from "@/features/coupons/domain";
import {
  collectIssue,
  duplicateIssue,
  parseBooleanField,
  parseIntegerField,
  parseIsoDate,
  requiredText
} from "./common";
import { createIssue } from "../safety";
import type { NormalizationResult, NormalizedCoupon, ParsedRecord } from "../types";

const couponTypes = new Set(["percentage", "fixed_amount", "free_shipping"]);

export function normalizeCoupons(records: ParsedRecord[]): NormalizationResult<NormalizedCoupon> {
  const normalized: NormalizedCoupon[] = [];
  const issues: NormalizationResult<NormalizedCoupon>["issues"] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const codeRaw = requiredText(record, "code", "coupons", "Codigo do cupom");
    const typeRaw = requiredText(record, "type", "coupons", "Tipo do cupom");
    const value = parseIntegerField(record, "value", "coupons", "Valor do cupom", { required: true, min: 0 });
    const startsAt = parseIsoDate(record, "starts_at", "coupons");
    const endsAt = parseIsoDate(record, "ends_at", "coupons");
    const maxUses = parseIntegerField(record, "max_uses", "coupons", "Limite de uso", { defaultValue: 0, min: 0 });
    const usedCount = parseIntegerField(record, "used_count", "coupons", "Uso atual", { defaultValue: 0, min: 0 });
    const minimumSubtotal = parseIntegerField(record, "minimum_subtotal_cents", "coupons", "Subtotal minimo", {
      defaultValue: 0,
      min: 0
    });

    for (const issue of [
      codeRaw.issue,
      typeRaw.issue,
      value.issue,
      startsAt.issue,
      endsAt.issue,
      maxUses.issue,
      usedCount.issue,
      minimumSubtotal.issue
    ]) {
      collectIssue(issues, issue);
    }

    const code = normalizeCouponCode(codeRaw.value);
    const type = typeRaw.value.trim().toLowerCase();
    const isActive = parseBooleanField(record, "is_active", true);

    if (code && seen.has(code)) {
      issues.push(duplicateIssue("coupons", "code", code));
    }
    seen.add(code);

    if (!couponTypes.has(type)) {
      issues.push(couponIssue("Tipo de cupom invalido.", "type", record.lineNumber, code, "corrigir-mapeamento"));
    }

    if (isActive) {
      if (type === "percentage" && (value.value < 1 || value.value > 100)) {
        issues.push(couponIssue("Percentual de cupom ativo precisa ficar entre 1 e 100.", "value", record.lineNumber, code));
      }
      if (type === "fixed_amount" && value.value <= 0) {
        issues.push(couponIssue("Cupom de valor fixo ativo precisa ter valor positivo.", "value", record.lineNumber, code));
      }
    }

    normalized.push({
      code,
      type: couponTypes.has(type) ? (type as NormalizedCoupon["type"]) : "fixed_amount",
      value: value.value,
      startsAt: startsAt.value,
      endsAt: endsAt.value,
      maxUses: maxUses.value > 0 ? maxUses.value : null,
      usedCount: usedCount.value,
      minimumSubtotalCents: minimumSubtotal.value > 0 ? minimumSubtotal.value : null,
      isActive
    });
  }

  return { records: normalized, issues };
}

function couponIssue(
  message: string,
  field: string,
  row: number,
  code: string,
  recommendedAction: "corrigir-origem" | "corrigir-mapeamento" = "corrigir-origem"
) {
  return createIssue({
    code: "INVALID_VALUE",
    entity: "coupons",
    severity: "HIGH",
    goLiveImpact: "bloqueador",
    message,
    field,
    row,
    entityKey: code,
    recommendedAction
  });
}
