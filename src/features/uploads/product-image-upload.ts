import { put } from "@vercel/blob";
import { env } from "@/lib/env";
import { runtimeMessages } from "@/lib/runtime-mode";
import { createProductRepository } from "@/features/products/server/product-repository";
import { productImageUploadSchema } from "./schemas";

export type ProductImageUploadInput = {
  productId: string;
  file: File;
  altText?: string;
  sortOrder?: number;
  isCover?: boolean;
  width?: number | null;
  height?: number | null;
};

export type ProductImageUploadResult =
  | {
      status: "rejected";
      reason: "invalid_file";
      message: string;
    }
  | {
      status: "blocked";
      reason: "missing_blob_token";
      message: string;
    }
  | {
      status: "uploaded";
      blobUrl: string;
      pathname: string;
      altText?: string | null;
      sortOrder: number;
      isCover: boolean;
      width?: number | null;
      height?: number | null;
      contentType: string;
      sizeBytes: number;
      metadata:
        | {
            status: "persisted";
            imageId: string;
            message: string;
          }
        | {
            status: "blocked" | "dev_fallback";
            imageId: null;
            message: string;
          };
    };

export async function uploadProductImage(input: ProductImageUploadInput): Promise<ProductImageUploadResult> {
  const parsed = productImageUploadSchema.safeParse({
    ...input,
    altText: input.altText ?? null,
    sortOrder: input.sortOrder ?? 0,
    isCover: input.isCover ?? false
  });

  if (!parsed.success) {
    return {
      status: "rejected",
      reason: "invalid_file",
      message: parsed.error.issues[0]?.message ?? "Imagem invalida."
    };
  }

  if (env.BLOB_READ_WRITE_TOKEN.length === 0) {
    return {
      status: "blocked",
      reason: "missing_blob_token",
      message: runtimeMessages.blobMissing
    };
  }

  const { file, productId } = parsed.data;
  const pathname = `products/${productId}/${crypto.randomUUID()}-${file.name}`;
  const blob = await put(pathname, file, {
    access: "public",
    token: env.BLOB_READ_WRITE_TOKEN
  });

  const metadata = await createProductRepository().saveProductImageMetadata({
    productId,
    blobUrl: blob.url,
    pathname: blob.pathname,
    altText: parsed.data.altText,
    sortOrder: parsed.data.sortOrder,
    isCover: parsed.data.isCover,
    width: parsed.data.width,
    height: parsed.data.height,
    contentType: file.type,
    sizeBytes: file.size
  });

  return {
    status: "uploaded",
    blobUrl: blob.url,
    pathname: blob.pathname,
    altText: parsed.data.altText,
    sortOrder: parsed.data.sortOrder,
    isCover: parsed.data.isCover,
    width: parsed.data.width,
    height: parsed.data.height,
    contentType: file.type,
    sizeBytes: file.size,
    metadata
  };
}
