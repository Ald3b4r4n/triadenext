import Link from "next/link";
import { PaymentElementForm } from "@/features/payments/components/payment-element-form";
import { getOrderPaymentStatusAction } from "@/features/payments/server/payment-actions";
import { OrderSummary } from "@/features/orders/components/order-summary";

export default async function CustomerPaymentPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderPaymentStatusAction(id);

  if (result.status !== "success") {
    return (
      <main className="page-shell">
        <section className="page-intro">
          <p className="muted">Pagamento</p>
          <h1>Pedido indisponível</h1>
          <p>{result.message}</p>
          <Link className="secondary-action" href="/pedidos">
            Voltar aos pedidos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Pagamento do pedido {result.order.number}</p>
        <h1>
          {result.order.status === "pago"
            ? "Pagamento confirmado"
            : "Concluir pagamento"}
        </h1>
        <p>
          O retorno do navegador não marca o pedido como pago. A confirmação final acontece
          de forma segura no servidor.
        </p>
      </section>
      <OrderSummary order={result.order} paymentIntent={result.paymentIntent} />
      {result.order.status === "aguardando_pagamento" ? (
        <PaymentElementForm orderId={result.order.id} />
      ) : null}
    </main>
  );
}
