import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminLikeMock, listForAdminOrderMock } = vi.hoisted(() => ({
  requireAdminLikeMock: vi.fn(),
  listForAdminOrderMock: vi.fn()
}));

vi.mock("@/features/auth/server/policies", () => ({
  requireAdminLike: requireAdminLikeMock,
  policyMessage: () => "Acesso bloqueado."
}));

vi.mock("@/features/notifications/drizzle-repository", () => ({
  createNotificationRepository: () => ({
    listForAdminOrder: listForAdminOrderMock
  })
}));

import { listAdminNotificationDeliveriesAction } from "@/features/notifications/server/notification-actions";

describe("notification admin access", () => {
  beforeEach(() => {
    requireAdminLikeMock.mockReset();
    listForAdminOrderMock.mockReset();
  });

  it.each([
    { status: "unauthenticated", reason: "missing" },
    { status: "forbidden", reason: "insufficient_role" }
  ])("blocks visitor/customer before reading notification status", async (decision) => {
    requireAdminLikeMock.mockResolvedValue(decision);

    await expect(
      listAdminNotificationDeliveriesAction(["order-1"])
    ).resolves.toMatchObject({ status: decision.status });
    expect(listForAdminOrderMock).not.toHaveBeenCalled();
  });

  it.each(["admin", "manager"])("allows %s to read basic notification status", async (role) => {
    requireAdminLikeMock.mockResolvedValue({
      status: "allowed",
      userId: `${role}-1`,
      role
    });
    listForAdminOrderMock.mockResolvedValue([]);

    await expect(
      listAdminNotificationDeliveriesAction(["order-1"])
    ).resolves.toEqual({
      status: "success",
      deliveriesByOrder: { "order-1": [] }
    });
  });
});
