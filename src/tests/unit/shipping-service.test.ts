import { describe, expect, it } from "vitest";
import { isQuoteExpired } from "@/features/shipping/domain";
import { quoteShippingForCart } from "@/features/shipping/server/shipping-service";

describe("shipping service", () => {
  it("quotes manual fallback options without external providers", async () => {
    const result = await quoteShippingForCart({
      cartId: "cart-service-test",
      cartHash: "hash",
      postalCode: "01001-000"
    });

    expect(result.status).toBe("success");
    expect(result.status === "success" && result.quote.provider).toBe("manual");
    expect(result.status === "success" && result.quote.options[0]?.provider).toBe("manual");
  });

  it("rejects invalid postal codes and detects expired quotes", async () => {
    await expect(
      quoteShippingForCart({ cartId: "cart-invalid", cartHash: "hash", postalCode: "1" })
    ).resolves.toMatchObject({ status: "validation_error" });

    expect(isQuoteExpired({ expiresAt: new Date("2026-01-01T00:00:00.000Z") }, new Date("2026-01-02T00:00:00.000Z"))).toBe(true);
  });
});
