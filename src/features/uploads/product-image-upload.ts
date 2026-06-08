import { put } from "@vercel/blob";
import { env } from "@/lib/env";

export type ProductImageUploadInput = {
  productId: string;
  file: File;
  altText?: string;
  isCover?: boolean;
};

export type ProductImageUploadResult =
  | {
      status: "blocked";
      reason: "missing_blob_token";
      message: string;
    }
  | {
      status: "uploaded";
      blobUrl: string;
      pathname: string;
      contentType: string;
      sizeBytes: number;
    };

export async function uploadProductImage(input: ProductImageUploadInput): Promise<ProductImageUploadResult> {
  if (env.BLOB_READ_WRITE_TOKEN.length === 0) {
    return {
      status: "blocked",
      reason: "missing_blob_token",
      message: "Upload real bloqueado: BLOB_READ_WRITE_TOKEN nao esta configurado."
    };
  }

  const pathname = `products/${input.productId}/${crypto.randomUUID()}-${input.file.name}`;
  const blob = await put(pathname, input.file, {
    access: "public",
    token: env.BLOB_READ_WRITE_TOKEN
  });

  return {
    status: "uploaded",
    blobUrl: blob.url,
    pathname: blob.pathname,
    contentType: input.file.type,
    sizeBytes: input.file.size
  };
}
