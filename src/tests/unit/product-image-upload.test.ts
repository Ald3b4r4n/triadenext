import { describe, expect, it, vi } from "vitest";
import { uploadProductImage } from "@/features/uploads/product-image-upload";
import { maxProductImageSizeBytes } from "@/features/uploads/schemas";

vi.mock("@/features/auth/server/policies", () => ({
  requireAdminLike: vi.fn(async () => ({
    status: "allowed",
    userId: "user-1",
    role: "admin"
  })),
  policyMessage: vi.fn(() => "Autorizado.")
}));

describe("product image upload", () => {
  it("blocks real upload when BLOB_READ_WRITE_TOKEN is missing", async () => {
    const result = await uploadProductImage({
      productId: "prod-example-published",
      file: new File(
        [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
        "image.png",
        { type: "image/png" }
      )
    });

    expect(result.status).toBe("blocked");
    if (result.status === "blocked") {
      expect(result.reason).toBe("missing_blob_token");
    }
  });

  it("rejects a spoofed MIME type when the file signature is invalid", async () => {
    const result = await uploadProductImage({
      productId: "prod-example-published",
      file: new File(["not-an-image"], "image.png", { type: "image/png" })
    });

    expect(result.status).toBe("rejected");
    if (result.status === "rejected") {
      expect(result.message).toMatch(/conteúdo do arquivo/i);
    }
  });

  it("rejects invalid image types", async () => {
    const result = await uploadProductImage({
      productId: "prod-example-published",
      file: new File(["text"], "file.txt", { type: "text/plain" })
    });

    expect(result.status).toBe("rejected");
    if (result.status === "rejected") {
      expect(result.reason).toBe("invalid_file");
    }
  });

  it("rejects files above the size limit", async () => {
    const oversizedFile = new File([new Uint8Array(maxProductImageSizeBytes + 1)], "large.png", {
      type: "image/png"
    });

    const result = await uploadProductImage({
      productId: "prod-example-published",
      file: oversizedFile
    });

    expect(result.status).toBe("rejected");
    if (result.status === "rejected") {
      expect(result.reason).toBe("invalid_file");
    }
  });
});
