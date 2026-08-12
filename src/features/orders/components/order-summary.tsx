import { CalendarClock, CheckCircle2, CreditCard, Package } from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { PaymentIntentRecord } from "@/features/payments/types";
import type { OrderStatus, PendingOrder } from "../types";

export function OrderSummary({
  order,
  paymentIntent
}: {
  order: PendingOrder;
  paymentIntent?: PaymentIntentRecord | null;
}) {
  const paid = order.status === "pago";

  return (
    <article className="order-overview" data-testid="pending-order-summary">
      <header className="order-overview__header">
        <div>
          <span>Pedido {order.number}</span>
          <h2>{statusLabel(order.status)}</h2>
        </div>
        <span className={`order-status order-status--${order.status}`}>
          <i aria-hidden="true" />
          {paid ? "Pagamento confirmado" : statusLabel(order.status)}
        </span>
      </header>

      <dl className="order-overview__facts">
        <div>
          <dt><CreditCard aria-hidden="true" size={17} /> Total</dt>
          <dd>{formatMoney(order.grandTotalCents)}</dd>
        </div>
        <div>
          <dt><Package aria-hidden="true" size={17} /> Itens</dt>
          <dd>{order.items.reduce((total, item) => total + item.quantity, 0)}</dd>
        </div>
        {order.status === "aguardando_pagamento" ? (
          <div>
            <dt><CalendarClock aria-hidden="true" size={17} /> Prazo para pagar</dt>
            <dd>{order.expiresAt.toLocaleString("pt-BR")}</dd>
          </div>
        ) : null}
        {order.paidAt ? (
          <div>
            <dt><CheckCircle2 aria-hidden="true" size={17} /> Confirmado em</dt>
            <dd>{order.paidAt.toLocaleString("pt-BR")}</dd>
          </div>
        ) : null}
      </dl>

      {paymentIntent?.status === "processando" ? (
        <p className="order-overview__notice">O pagamento está sendo confirmado com segurança.</p>
      ) : null}
    </article>
  );
}

export function OrderItemsSummary({ order }: { order: PendingOrder }) {
  return (
    <section className="order-items-summary" aria-labelledby="order-items-title">
      <header>
        <h2 id="order-items-title">Itens da compra</h2>
        <span>{order.items.length} {order.items.length === 1 ? "produto" : "produtos"}</span>
      </header>
      <div>
        {order.items.map((item) => (
          <article className="order-item-summary" key={item.id}>
            {item.imageSnapshot ? (
              <div className="order-item-summary__image" style={{ backgroundImage: `url("${item.imageSnapshot.replaceAll('"', "%22")}")` }} />
            ) : (
              <div className="order-item-summary__image order-item-summary__image--empty"><Package aria-hidden="true" size={20} /></div>
            )}
            <div>
              <h3>{item.nameSnapshot}</h3>
              <p>{item.quantity} {item.quantity === 1 ? "unidade" : "unidades"} · {formatMoney(item.unitPriceCents)} cada</p>
            </div>
            <strong>{formatMoney(item.lineTotalCents)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    aguardando_pagamento: "Aguardando pagamento",
    pago: "Pagamento confirmado",
    em_preparacao: "Pedido em preparação",
    enviado: "Pedido enviado",
    entregue: "Pedido entregue",
    cancelado: "Pedido cancelado",
    expirado: "Prazo de pagamento encerrado",
    reembolsado: "Pedido reembolsado"
  };

  return labels[status];
}
