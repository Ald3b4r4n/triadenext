import { formatMoney } from "@/lib/money";
import type { PendingOrder } from "../types";

export function OrderSummary({ order }: { order: PendingOrder }) {
  return (
    <article className="placeholder-panel" data-testid="pending-order-summary">
      <p className="muted">Pedido {order.number}</p>
      <h2>Status: {order.status}</h2>
      <p>Total: {formatMoney(order.grandTotalCents)}</p>
      <p>Expira em: {order.expiresAt.toLocaleString("pt-BR")}</p>
      <p className="muted">Pagamento real, cartão e PaymentIntent ficam fora desta fase.</p>
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
