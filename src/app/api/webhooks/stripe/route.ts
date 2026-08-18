import { NextResponse } from "next/server";
import { processStripeWebhook } from "@/features/payments/server/stripe-webhook-service";

const maxStripeWebhookBytes = 1024 * 1024;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxStripeWebhookBytes) {
    return NextResponse.json(
      { status: "failed", message: "Evento de pagamento acima do limite permitido." },
      { status: 413 }
    );
  }

  const rawBody = await readBoundedWebhookBody(request);
  if (rawBody === null) {
    return NextResponse.json(
      { status: "failed", message: "Evento de pagamento inválido ou acima do limite permitido." },
      { status: 413 }
    );
  }

  const result = await processStripeWebhook({
    rawBody,
    signature: request.headers.get("stripe-signature")
  });

  if (result.status === "failed") {
    const responseStatus = result.failureKind === "invalid_request"
      ? 400
      : result.failureKind === "unavailable"
        ? 503
        : 500;
    return NextResponse.json(
      { status: result.status, message: result.message },
      { status: responseStatus }
    );
  }

  return NextResponse.json(result, { status: 200 });
}

async function readBoundedWebhookBody(request: Request) {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > maxStripeWebhookBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }

    const merged = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder().decode(merged);
  } catch {
    return null;
  }
}
