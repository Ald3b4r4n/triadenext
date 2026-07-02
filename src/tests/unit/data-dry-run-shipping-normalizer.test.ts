import { describe, expect, it } from "vitest";
import { normalizeShippingRules } from "@/features/data-dry-run/normalizers/shipping";

describe("data dry-run shipping normalizer", () => {
  it("normalizes UF and postal ranges for manual shipping", () => {
    const result = normalizeShippingRules([
      {
        file: "shipping-rules.csv",
        lineNumber: 2,
        values: {
          rule_code: "SP",
          name: "Entrega SP",
          uf: "sp",
          postal_code_start: "01000-000",
          postal_code_end: "05999-999",
          price_cents: "1290",
          estimated_days: "3",
          is_active: "true"
        }
      }
    ]);

    expect(result.records[0]).toMatchObject({
      ruleCode: "SP",
      uf: "SP",
      postalCodeStart: "01000000",
      postalCodeEnd: "05999999",
      priceCents: 1290
    });
    expect(result.issues).toHaveLength(0);
  });

  it("blocks active shipping without UF or postal range", () => {
    const result = normalizeShippingRules([
      {
        file: "shipping-rules.csv",
        lineNumber: 2,
        values: {
          rule_code: "INVALID",
          name: "Sem cobertura",
          price_cents: "0",
          estimated_days: "3",
          is_active: "true"
        }
      }
    ]);

    expect(result.issues.some((issue) => issue.code === "INVALID_VALUE")).toBe(true);
  });
});
