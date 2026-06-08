import { describe, expect, it } from "vitest";
import { clampDiscount, formatMoney } from "@/lib/money";

describe("money utilities", () => {
  it("formats cents as Brazilian Real", () => {
    expect(formatMoney(12990)).toBe("R$ 129,90");
  });

  it("does not allow coupon discount above subtotal", () => {
    expect(clampDiscount(10_000, 15_000)).toBe(10_000);
  });
});
