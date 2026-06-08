import { normalizeSlug as normalizeBaseSlug } from "@/lib/slug";
import type { Product, ProductImage, PublicProduct } from "./types";

export function isProductPublic(product: Product, now = new Date()) {
  return (
    product.status === "published" &&
    product.publishedAt !== null &&
    product.publishedAt !== undefined &&
    product.publishedAt <= now &&
    product.stockQuantity > 0
  );
}

export function isProductAvailableForPurchase(product: Product, now = new Date()) {
  return isProductPublic(product, now);
}

export function normalizeProductSlug(input: string) {
  return normalizeBaseSlug(input);
}

export function sortProductImages(images: ProductImage[]) {
  return [...images].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });
}

export function selectCoverImage(images: ProductImage[]) {
  const sortedImages = sortProductImages(images);
  return sortedImages.find((image) => image.isCover) ?? sortedImages[0] ?? null;
}

export function toPublicProduct(product: Product, now = new Date()): PublicProduct | null {
  if (!isProductPublic(product, now)) {
    return null;
  }

  return {
    ...product,
    images: sortProductImages(product.images),
    coverImage: selectCoverImage(product.images)
  };
}

export function filterPublicProducts(products: Product[], now = new Date()) {
  return products
    .map((product) => toPublicProduct(product, now))
    .filter((product): product is PublicProduct => product !== null);
}
