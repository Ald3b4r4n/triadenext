import { NextResponse } from "next/server";
import { sensitiveRuntimeEnv } from "@/lib/env";

export async function POST() {
  // Placeholder seguro: a implementacao real usara Vercel Blob somente com token configurado.
  if (!sensitiveRuntimeEnv.hasBlobToken) {
    return NextResponse.json(
      {
        status: "missing_blob_token",
        message: "Upload real desativado ate configurar BLOB_READ_WRITE_TOKEN."
      },
      { status: 501 }
    );
  }

  return NextResponse.json(
    {
      status: "placeholder",
      message: "Fluxo Blob sera implementado em fase posterior."
    },
    { status: 202 }
  );
}
