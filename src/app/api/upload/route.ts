import { NextResponse } from "next/server";
import { sensitiveRuntimeEnv } from "@/lib/env";
import { runtimeMessages } from "@/lib/runtime-mode";

export async function POST() {
  // Placeholder seguro: a implementacao real usara Vercel Blob somente com token configurado.
  if (!sensitiveRuntimeEnv.hasBlobToken) {
    return NextResponse.json(
      {
        status: "missing_blob_token",
        message: runtimeMessages.blobMissing
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
