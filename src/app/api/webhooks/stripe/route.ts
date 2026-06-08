import { NextResponse } from "next/server";

export async function POST() {
  // Placeholder seguro: a implementacao real validara assinatura, idempotencia e efeitos
  // encadeados conforme docs/migration/parity-test-plan.md.
  return NextResponse.json(
    {
      status: "placeholder",
      message: "Stripe webhook ainda nao processa pagamentos reais nesta fase."
    },
    { status: 202 }
  );
}
