import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminLikeMock, uploadProductImageMock, setProductCoverImageMock } =
  vi.hoisted(() => ({
    requireAdminLikeMock: vi.fn(),
    uploadProductImageMock: vi.fn(),
    setProductCoverImageMock: vi.fn()
  }));

vi.mock("@/features/auth/server/policies", () => ({
  requireAdminLike: requireAdminLikeMock
}));

vi.mock("@/features/uploads/product-image-upload", () => ({
  uploadProductImage: uploadProductImageMock,
  setProductCoverImage: setProductCoverImageMock
}));

import { POST } from "@/app/api/upload/route";

describe("upload route security", () => {
  beforeEach(() => {
    requireAdminLikeMock.mockReset();
    uploadProductImageMock.mockReset();
    setProductCoverImageMock.mockReset();
  });

  it("rejects unauthenticated requests before parsing the body", async () => {
    requireAdminLikeMock.mockResolvedValue({
      status: "unauthenticated",
      reason: "missing"
    });

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}"
      })
    );

    expect(response.status).toBe(401);
    expect(uploadProductImageMock).not.toHaveBeenCalled();
  });

  it("rejects non-multipart content for an authenticated admin", async () => {
    requireAdminLikeMock.mockResolvedValue({
      status: "allowed",
      userId: "admin-1",
      role: "admin"
    });

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}"
      })
    );

    expect(response.status).toBe(415);
    expect(uploadProductImageMock).not.toHaveBeenCalled();
  });
});
