import { NextResponse } from "next/server";
import { processStripeWebhook } from "@/features/payments/server/stripe-webhook-service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const result = await processStripeWebhook({
    rawBody,
    signature: request.headers.get("stripe-signature")
  });

  if (result.status === "failed") {
    const invalidSignature = /assinatura/i.test(result.message);
    return NextResponse.json(
      { status: result.status, message: result.message },
      { status: invalidSignature ? 400 : 500 }
    );
  }

  return NextResponse.json(result, { status: 200 });
}
