import { describe, expect, it } from "vitest";
import {
  PENDING_ORDER_STATUS,
  calculatePendingOrderExpiration,
  normalizePostalCode
} from "@/features/orders/domain";

describe("pending order domain", () => {
  it("uses aguardando_pagamento as the initial status and expires after 60 minutes", () => {
    const createdAt = new Date("2026-06-10T12:00:00.000Z");

    expect(PENDING_ORDER_STATUS).toBe("aguardando_pagamento");
    expect(calculatePendingOrderExpiration(createdAt).toISOString()).toBe("2026-06-10T13:00:00.000Z");
  });

  it("normalizes postal codes for address and freight consistency checks", () => {
    expect(normalizePostalCode("01001-000")).toBe("01001000");
  });
});
