import { NextResponse } from "next/server";
import { lookupPostalCode } from "@/features/checkout/server/postal-code-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ postalCode: string }> }
) {
  const { postalCode } = await context.params;
  const normalized = postalCode.replace(/\D/g, "");
  if (!/^\d{8}$/.test(normalized)) {
    return NextResponse.json({ message: "CEP inválido." }, { status: 400 });
  }

  const address = await lookupPostalCode(normalized);
  if (!address) {
    return NextResponse.json({ message: "CEP não encontrado." }, { status: 404 });
  }

  return NextResponse.json(address, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" }
  });
}
