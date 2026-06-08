import { describe, expect, it } from "vitest";
import { selectCoverImage, sortProductImages } from "@/features/products/domain";
import type { ProductImage } from "@/features/products/types";

const baseImage = {
  productId: "prod",
  blobUrl: "https://example.com/image.png",
  pathname: "image.png",
  altText: null,
  width: 100,
  height: 100,
  sizeBytes: 1000,
  contentType: "image/png"
};

describe("product images domain", () => {
  it("selects the explicit cover image", () => {
    const images: ProductImage[] = [
      {
        ...baseImage,
        id: "first",
        sortOrder: 1,
        isCover: false,
        createdAt: new Date("2026-01-01T00:00:00.000Z")
      },
      {
        ...baseImage,
        id: "cover",
        sortOrder: 2,
        isCover: true,
        createdAt: new Date("2026-01-02T00:00:00.000Z")
      }
    ];

    expect(selectCoverImage(images)?.id).toBe("cover");
  });

  it("falls back to the first image ordered by sortOrder", () => {
    const images: ProductImage[] = [
      {
        ...baseImage,
        id: "second",
        sortOrder: 20,
        isCover: false,
        createdAt: new Date("2026-01-02T00:00:00.000Z")
      },
      {
        ...baseImage,
        id: "first",
        sortOrder: 10,
        isCover: false,
        createdAt: new Date("2026-01-01T00:00:00.000Z")
      }
    ];

    expect(sortProductImages(images).map((image) => image.id)).toEqual(["first", "second"]);
    expect(selectCoverImage(images)?.id).toBe("first");
  });
});
