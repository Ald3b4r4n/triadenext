import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, CreditCard, House } from "lucide-react";
import { PaymentElementForm } from "@/features/payments/components/payment-element-form";
import { getOrderPaymentStatusAction } from "@/features/payments/server/payment-actions";
import { OrderItemsSummary, OrderSummary } from "@/features/orders/components/order-summary";

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

  const paymentComplete = ["pago", "em_preparacao", "enviado", "entregue"].includes(
    result.order.status
  );

  return (
    <main className="page-shell payment-page">
      <ol className="checkout-steps" aria-label="Etapas da compra">
        <li className="checkout-step checkout-step--complete"><Check aria-hidden="true" size={15} /> Carrinho</li>
        <li className="checkout-step checkout-step--complete"><Check aria-hidden="true" size={15} /> Identificação</li>
        <li className={`checkout-step ${paymentComplete ? "checkout-step--complete" : "checkout-step--current"}`}>
          {paymentComplete ? <Check aria-hidden="true" size={15} /> : <CreditCard aria-hidden="true" size={15} />} Pagamento
        </li>
      </ol>

      {paymentComplete ? (
        <section className="payment-success" aria-labelledby="payment-success-title">
          <CheckCircle2 aria-hidden="true" size={42} />
          <span>Compra confirmada</span>
          <h1 id="payment-success-title">Pagamento aprovado</h1>
          <p>Recebemos seu pagamento. Agora você pode acompanhar a preparação e o envio em seus pedidos.</p>
          <div className="action-row">
            <Link className="primary-action" href="/pedidos">Acompanhar pedido <ArrowRight aria-hidden="true" size={17} /></Link>
            <Link className="secondary-action" href="/"><House aria-hidden="true" size={17} /> Voltar ao início</Link>
          </div>
        </section>
      ) : (
        <section className="payment-heading">
          <div>
            <span>Pedido {result.order.number}</span>
            <h1>Concluir pagamento</h1>
            <p>Preencha os dados no ambiente seguro para confirmar sua compra.</p>
          </div>
          <strong>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(result.order.grandTotalCents / 100)}</strong>
        </section>
      )}

      <section className="payment-layout">
        <div>
          {paymentComplete ? (
            <OrderItemsSummary order={result.order} />
          ) : result.order.status === "aguardando_pagamento" ? (
            <PaymentElementForm orderId={result.order.id} />
          ) : null}
        </div>
        <aside>
          <OrderSummary order={result.order} paymentIntent={result.paymentIntent} />
        </aside>
      </section>
    </main>
  );
}
