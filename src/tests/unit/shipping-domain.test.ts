import { describe, expect, it } from "vitest";
import {
  buildManualShippingOptions,
  formatPostalCode,
  normalizePostalCode,
  validatePostalCode
} from "@/features/shipping/domain";
import type { ShippingManualRule } from "@/features/shipping/types";

describe("shipping domain", () => {
  it("normalizes and validates Brazilian postal codes", () => {
    expect(normalizePostalCode("01001-000")).toBe("01001000");
    expect(formatPostalCode("01001000")).toBe("01001-000");
    expect(validatePostalCode("abc").status).toBe("invalid");
  });

  it("matches manual rules by UF and postal range with deterministic priority", () => {
    const options = buildManualShippingOptions(
      [
        rule({ id: "low", name: "SP economico", uf: "SP", priority: 1, priceCents: 990 }),
        rule({
          id: "range",
          name: "Capital expresso",
          ruleType: "postal_range",
          uf: null,
          postalCodeStart: "01000000",
          postalCodeEnd: "05999999",
          priority: 20,
          priceCents: 1590
        })
      ],
      { postalCode: "01001000", state: "SP" }
    );

    expect(options.map((option) => option.label)).toEqual(["Capital expresso", "SP economico"]);
  });

  it("ignores inactive rules and returns no coverage when none apply", () => {
    const options = buildManualShippingOptions(
      [rule({ id: "inactive", isActive: false })],
      { postalCode: "01001000", state: "SP" }
    );

    expect(options).toHaveLength(0);
  });
});

function rule(overrides: Partial<ShippingManualRule> = {}): ShippingManualRule {
  const date = new Date("2026-01-10T12:00:00.000Z");
  return {
    id: "rule-test",
    name: "SP",
    provider: "manual",
    ruleType: "uf",
    uf: "SP",
    postalCodeStart: null,
    postalCodeEnd: null,
    priceCents: 1290,
    estimatedDays: 5,
    priority: 10,
    isActive: true,
    createdAt: date,
    updatedAt: date,
    ...overrides
  };
}
