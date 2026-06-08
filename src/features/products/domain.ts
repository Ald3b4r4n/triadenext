import { normalizeSlug as normalizeBaseSlug } from "@/lib/slug";
import type { Product, ProductImage, ProductMutationInput, PublicProduct } from "./types";

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

export function parsePriceToCents(input: string | number | null | undefined) {
  if (input === null || input === undefined || input === "") {
    return null;
  }

  if (typeof input === "number") {
    return Math.round(input * 100);
  }

  const normalized = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const value = Number(normalized);

  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.round(value * 100);
}

export function productCanBeMarkedPublic(input: ProductMutationInput, now = new Date()) {
  if (input.status !== "published") {
    return true;
  }

  return (
    input.name.trim().length > 0 &&
    input.slug.trim().length > 0 &&
    input.sku.trim().length > 0 &&
    input.priceCents > 0 &&
    input.stockQuantity > 0 &&
    input.publishedAt !== null &&
    input.publishedAt !== undefined &&
    input.publishedAt <= now
  );
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
