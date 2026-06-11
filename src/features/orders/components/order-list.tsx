import Link from "next/link";
import { NotificationStatus } from "@/features/notifications/components/notification-status";
import type { NotificationDelivery } from "@/features/notifications/types";
import { formatMoney } from "@/lib/money";
import type { PendingOrder } from "../types";

export function OrderList({
  orders,
  audience,
  notificationsByOrder = {}
}: {
  orders: PendingOrder[];
  audience: "customer" | "admin";
  notificationsByOrder?: Record<string, NotificationDelivery[]>;
}) {
  if (orders.length === 0) {
    return (
      <div className="placeholder-panel">
        <p className="muted">Pedidos</p>
        <h2>Nenhum pedido encontrado</h2>
        <p>
          {audience === "customer"
            ? "Quando um checkout for criado, ele aparecera aqui."
            : "Nao ha pedidos para acompanhamento administrativo."}
        </p>
      </div>
    );
  }

  return (
    <div className="cart-items" aria-label="Pedidos">
      {orders.map((order) => (
        <article className="cart-item" key={order.id}>
          <div>
            <h2>{order.number}</h2>
            <p className="muted">Status: {order.status}</p>
            <p>Criado em: {order.createdAt.toLocaleString("pt-BR")}</p>
            {order.status === "aguardando_pagamento" ? (
              <p>Expira em: {order.expiresAt.toLocaleString("pt-BR")}</p>
            ) : null}
            {order.paidAt ? <p>Pago em: {order.paidAt.toLocaleString("pt-BR")}</p> : null}
            {audience === "customer" && order.status === "aguardando_pagamento" ? (
              <Link className="secondary-action" href={`/pedidos/${order.id}/pagamento`}>
                Pagar pedido
              </Link>
            ) : null}
            {audience === "admin" ? (
              <NotificationStatus deliveries={notificationsByOrder[order.id] ?? []} />
            ) : null}
          </div>
          <strong>{formatMoney(order.grandTotalCents)}</strong>
        </article>
      ))}
    </div>
  );
}
