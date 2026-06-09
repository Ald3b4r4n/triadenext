import { describe, expect, it, vi } from "vitest";

const { requireAdminLikeMock } = vi.hoisted(() => ({
  requireAdminLikeMock: vi.fn()
}));

vi.mock("@/features/auth/server/policies", () => ({
  requireAdminLike: requireAdminLikeMock,
  policyMessage: vi.fn((decision) =>
    decision.status === "allowed" ? "Autorizado." : "Acesso negado para esta operacao."
  )
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

import { createShippingRuleAction, listShippingRulesAction } from "@/features/shipping/server/admin-shipping-actions";

describe("admin shipping actions", () => {
  it("blocks visitors and customers before listing manual rules", async () => {
    requireAdminLikeMock.mockResolvedValueOnce({ status: "forbidden", reason: "insufficient_role" });

    await expect(listShippingRulesAction()).resolves.toMatchObject({ status: "forbidden" });
  });

  it("allows admin-like users to create manual rules in fallback mode", async () => {
    requireAdminLikeMock.mockResolvedValueOnce({ status: "allowed", userId: "admin", role: "admin" });
    const formData = new FormData();
    formData.set("name", "SP teste");
    formData.set("uf", "SP");
    formData.set("priceCents", "1200");
    formData.set("estimatedDays", "5");
    formData.set("priority", "10");
    formData.set("isActive", "on");

    await expect(createShippingRuleAction(formData)).resolves.toMatchObject({ status: "success" });
  });
});
