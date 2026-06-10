import { describe, expect, it, vi } from "vitest";

const { requireCustomerMock, requireAdminLikeMock, listCustomerMock, listAdminMock } = vi.hoisted(() => ({
  requireCustomerMock: vi.fn(),
  requireAdminLikeMock: vi.fn(),
  listCustomerMock: vi.fn(),
  listAdminMock: vi.fn()
}));

vi.mock("@/features/auth/server/policies", () => ({
  requireCustomer: requireCustomerMock,
  requireAdminLike: requireAdminLikeMock,
  policyMessage: (decision: { status: string }) =>
    decision.status === "allowed" ? "Autorizado." : "Acesso bloqueado."
}));

vi.mock("@/features/orders/server/order-repository", () => ({
  createOrderRepository: () => ({
    listCustomerPendingOrders: listCustomerMock,
    getCustomerOrder: vi.fn(),
    listAdminPendingOrders: listAdminMock,
    getAdminOrder: vi.fn()
  })
}));

import {
  listAdminPendingOrdersAction,
  listCustomerPendingOrdersAction
} from "@/features/orders/server/order-actions";

describe("order read access", () => {
  it("filters customer reads by authenticated user id", async () => {
    requireCustomerMock.mockResolvedValue({ status: "allowed", userId: "customer-a", role: "customer" });
    listCustomerMock.mockResolvedValue([]);

    await expect(listCustomerPendingOrdersAction()).resolves.toMatchObject({ status: "success" });

    expect(listCustomerMock).toHaveBeenCalledWith("customer-a");
  });

  it("blocks non admin-like access before listing admin orders", async () => {
    requireAdminLikeMock.mockResolvedValue({ status: "forbidden", reason: "insufficient_role" });

    await expect(listAdminPendingOrdersAction()).resolves.toMatchObject({ status: "forbidden" });

    expect(listAdminMock).not.toHaveBeenCalled();
  });
});
