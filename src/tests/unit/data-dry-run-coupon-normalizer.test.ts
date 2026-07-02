import { describe, expect, it } from "vitest";
import { normalizeCoupons } from "@/features/data-dry-run/normalizers/coupons";

describe("data dry-run coupon normalizer", () => {
  it("normalizes active coupon codes and values", () => {
    const result = normalizeCoupons([
      {
        file: "coupons.csv",
        lineNumber: 2,
        values: {
          code: " bemvindo10 ",
          type: "percentage",
          value: "10",
          is_active: "true",
          minimum_subtotal_cents: "10000"
        }
      }
    ]);

    expect(result.records[0]).toMatchObject({
      code: "BEMVINDO10",
      type: "percentage",
      value: 10,
      minimumSubtotalCents: 10000,
      isActive: true
    });
    expect(result.issues).toHaveLength(0);
  });

  it("blocks invalid active percentage coupons", () => {
    const result = normalizeCoupons([
      {
        file: "coupons.csv",
        lineNumber: 2,
        values: { code: "MAX", type: "percentage", value: "150", is_active: "true" }
      }
    ]);

    expect(result.issues.some((issue) => issue.goLiveImpact === "bloqueador")).toBe(true);
  });
});
