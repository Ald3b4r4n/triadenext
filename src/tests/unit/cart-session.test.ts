import { describe, expect, it } from "vitest";
import { createGuestCartToken, readGuestCartTokenValue } from "@/features/cart/server/cart-session";

describe("cart session", () => {
  it("generates an opaque token without cart payload data", () => {
    const token = createGuestCartToken();

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).not.toContain("product");
    expect(token).not.toContain("price");
    expect(token).not.toContain("user");
  });

  it("rejects malformed guest cart tokens", () => {
    expect(readGuestCartTokenValue(undefined)).toBeNull();
    expect(readGuestCartTokenValue("short")).toBeNull();
    expect(readGuestCartTokenValue("invalid token with spaces")).toBeNull();
  });
});
