import { formatMoney } from "@/lib/money";
import type { PendingOrder } from "../types";

export function OrderList({ orders, audience }: { orders: PendingOrder[]; audience: "customer" | "admin" }) {
  if (orders.length === 0) {
    return (
      <div className="placeholder-panel">
        <p className="muted">Pedidos pendentes</p>
        <h2>Nenhum pedido aguardando pagamento</h2>
        <p>
          {audience === "customer"
            ? "Quando um checkout pendente for criado, ele aparecera aqui."
            : "Nao ha pedidos pendentes para acompanhamento administrativo."}
        </p>
      </div>
    );
  }

  return (
    <div className="cart-items" aria-label="Pedidos pendentes">
      {orders.map((order) => (
        <article className="cart-item" key={order.id}>
          <div>
            <h2>{order.number}</h2>
            <p className="muted">Status: {order.status}</p>
            <p>Criado em: {order.createdAt.toLocaleString("pt-BR")}</p>
            <p>Expira em: {order.expiresAt.toLocaleString("pt-BR")}</p>
          </div>
          <strong>{formatMoney(order.grandTotalCents)}</strong>
        </article>
      ))}
    </div>
  );
}
