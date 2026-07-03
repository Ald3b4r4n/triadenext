import { describe, expect, it } from "vitest";
import { createCartRepository } from "@/features/cart/server/cart-repository";

describe("cart repository fallback", () => {
  it("returns explicit dev fallback without real persistence claims", async () => {
    const repository = createCartRepository();
    const cart = await repository.getOrCreateActiveCart({
      kind: "guest",
      guestToken: "repository-fallback-guest"
    });

    expect(cart.persistence).toBe("dev_fallback");
    expect(cart.messages[0]).toContain("modo seguro de demonstração");
    expect(cart.messages[0]).not.toMatch(/DATABASE_URL|dev\/fixture|secret|token/i);
  });
});
