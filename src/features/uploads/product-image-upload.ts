import { put } from "@vercel/blob";
import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";
import { env } from "@/lib/env";
import { assertCanMutateRealData, runtimeMessages } from "@/lib/runtime-mode";
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
      reason: "missing_blob_token" | "missing_database" | "environment_guardrail" | "auth_not_ready";
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

export type ProductImageCoverResult =
  | { status: "updated"; imageId: string; message: string }
  | { status: "blocked"; message: string };

export async function uploadProductImage(input: ProductImageUploadInput): Promise<ProductImageUploadResult> {
  const policy = await requireAdminLike();

  if (policy.status !== "allowed") {
    return {
      status: "blocked",
      reason: policy.status === "blocked" ? policy.reason : "auth_not_ready",
      message: policyMessage(policy)
    };
  }

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

  const mutationGuardrail = assertCanMutateRealData();

  if (!mutationGuardrail.allowed) {
    return {
      status: "blocked",
      reason: "environment_guardrail",
      message: mutationGuardrail.message
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

export async function setProductCoverImage(input: {
  productId: string;
  imageId: string;
}): Promise<ProductImageCoverResult> {
  const policy = await requireAdminLike();

  if (policy.status !== "allowed") {
    return { status: "blocked", message: policyMessage(policy) };
  }

  if (!input.productId.trim() || !input.imageId.trim()) {
    return { status: "blocked", message: "Imagem ou produto inválido." };
  }

  const result = await createProductRepository().setProductCoverImage(
    input.productId,
    input.imageId
  );

  if (result.status !== "persisted") {
    return { status: "blocked", message: result.message };
  }

  return {
    status: "updated",
    imageId: result.imageId,
    message: result.message
  };
}
