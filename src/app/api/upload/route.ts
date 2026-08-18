import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  setProductCoverImage,
  uploadProductImage
} from "@/features/uploads/product-image-upload";
import { requireAdminLike } from "@/features/auth/server/policies";

const maxUploadRequestBytes = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const accessResponse = await requireUploadAccess();
  if (accessResponse) return accessResponse;

  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return NextResponse.json(
      { status: "rejected", message: "Envie a imagem como formulário multipart." },
      { status: 415 }
    );
  }

  if (Number.isFinite(contentLength) && contentLength > maxUploadRequestBytes) {
    return NextResponse.json(
      { status: "rejected", message: "O envio excede o limite permitido." },
      { status: 413 }
    );
  }

  const formData = await readBoundedFormData(request);

  if (!formData) {
    return NextResponse.json(
      { status: "rejected", message: "Não foi possível interpretar o arquivo enviado." },
      { status: 400 }
    );
  }
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

async function readBoundedFormData(request: Request) {
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > maxUploadRequestBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(Uint8Array.from(value).buffer);
    }

    const response = new Response(new Blob(chunks), {
      headers: { "content-type": request.headers.get("content-type") ?? "" }
    });
    return await response.formData();
  } catch {
    return null;
  }
}

export async function PATCH(request: Request) {
  const accessResponse = await requireUploadAccess();
  if (accessResponse) return accessResponse;

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

async function requireUploadAccess() {
  const policy = await requireAdminLike();
  if (policy.status === "allowed") return null;

  const status = policy.status === "unauthenticated" ? 401 : 403;
  return NextResponse.json(
    { status: "blocked", message: "Acesso administrativo necessário." },
    { status }
  );
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
