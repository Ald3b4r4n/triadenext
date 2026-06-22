import { formatMoney } from "@/lib/money";
import type { PaymentIntentRecord } from "@/features/payments/types";
import type { PendingOrder } from "../types";

export function OrderSummary({
  order,
  paymentIntent
}: {
  order: PendingOrder;
  paymentIntent?: PaymentIntentRecord | null;
}) {
  return (
    <article className="placeholder-panel" data-testid="pending-order-summary">
      <p className="muted">Pedido {order.number}</p>
      <h2>Status: {order.status}</h2>
      <p>Total: {formatMoney(order.grandTotalCents)}</p>
      {order.status === "aguardando_pagamento" ? (
        <p>Expira em: {order.expiresAt.toLocaleString("pt-BR")}</p>
      ) : null}
      {order.paidAt ? <p>Pago em: {order.paidAt.toLocaleString("pt-BR")}</p> : null}
      <p className="muted">
        Status do pagamento: {paymentIntent?.status ?? "ainda não iniciado"}
      </p>
      <p className="muted">
        Dados de cartão são coletados pelo provedor de pagamento seguro. O servidor não armazena dados sensíveis.
      </p>
    </article>
  );
}

export function OrderItemsSummary({ order }: { order: PendingOrder }) {
  return (
    <div className="cart-items" aria-label="Itens do pedido">
      {order.items.map((item) => (
        <article className="cart-item" key={item.id}>
          <div>
            <h2>{item.nameSnapshot}</h2>
            <p className="muted">SKU: {item.skuSnapshot}</p>
            <p>
              {item.quantity} x {formatMoney(item.unitPriceCents)}
            </p>
          </div>
          <strong>{formatMoney(item.lineTotalCents)}</strong>
        </article>
      ))}
    </div>
  );
}
