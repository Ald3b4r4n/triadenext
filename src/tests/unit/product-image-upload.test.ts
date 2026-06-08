import { describe, expect, it } from "vitest";
import { uploadProductImage } from "@/features/uploads/product-image-upload";
import { maxProductImageSizeBytes } from "@/features/uploads/schemas";

describe("product image upload", () => {
  it("blocks real upload when BLOB_READ_WRITE_TOKEN is missing", async () => {
    const result = await uploadProductImage({
      productId: "prod-example-published",
      file: new File(["image"], "image.png", { type: "image/png" })
    });

    expect(result.status).toBe("blocked");
    if (result.status === "blocked") {
      expect(result.reason).toBe("missing_blob_token");
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
