import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  setProductCoverImage,
  uploadProductImage
} from "@/features/uploads/product-image-upload";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const productId = formData.get("productId");

  if (!(file instanceof File) || typeof productId !== "string") {
    return NextResponse.json(
      { status: "rejected", message: "Selecione uma imagem válida." },
      { status: 400 }
    );
  }

  const result = await uploadProductImage({
    productId,
    file,
    altText: readText(formData.get("altText")),
    isCover: formData.get("isCover") === "true",
    sortOrder: readInteger(formData.get("sortOrder"))
  });

  if (result.status !== "uploaded") {
    return NextResponse.json(result, {
      status: result.status === "rejected" ? 400 : 503
    });
  }

  if (result.metadata.status !== "persisted") {
    return NextResponse.json(
      { status: "blocked", message: result.metadata.message },
      { status: 503 }
    );
  }

  revalidateProductImagePaths(productId);

  return NextResponse.json(
    {
      status: "uploaded",
      message: "Imagem enviada e vinculada ao produto.",
      image: {
        id: result.metadata.imageId,
        productId,
        blobUrl: result.blobUrl,
        pathname: result.pathname,
        altText: result.altText ?? null,
        sortOrder: result.sortOrder,
        isCover: result.isCover,
        width: result.width ?? null,
        height: result.height ?? null,
        sizeBytes: result.sizeBytes,
        contentType: result.contentType,
        createdAt: new Date().toISOString()
      }
    },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    productId?: unknown;
    imageId?: unknown;
  } | null;

  if (
    typeof body?.productId !== "string" ||
    typeof body.imageId !== "string"
  ) {
    return NextResponse.json(
      { status: "blocked", message: "Imagem ou produto inválido." },
      { status: 400 }
    );
  }

  const result = await setProductCoverImage({
    productId: body.productId,
    imageId: body.imageId
  });

  if (result.status !== "updated") {
    return NextResponse.json(result, { status: 403 });
  }

  revalidateProductImagePaths(body.productId);
  return NextResponse.json(result);
}

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function readInteger(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function revalidateProductImagePaths(productId: string) {
  revalidatePath(`/admin/produtos/${productId}/editar`);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath("/produtos");
}
