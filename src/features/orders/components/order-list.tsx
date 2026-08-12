import Link from "next/link";
import { CalendarDays, ChevronRight, Clock3, Package, Truck } from "lucide-react";
import { NotificationStatus } from "@/features/notifications/components/notification-status";
import type { NotificationDelivery } from "@/features/notifications/types";
import { formatMoney } from "@/lib/money";
import type { OrderStatus, PendingOrder } from "../types";

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
      <div className="placeholder-panel customer-orders-empty">
        <Package aria-hidden="true" size={28} />
        <p className="muted">Seus pedidos</p>
        <h2>Nenhuma compra por aqui ainda</h2>
        <p>Quando você concluir uma compra, poderá acompanhar pagamento e entrega nesta página.</p>
        <Link className="primary-action" href="/produtos">Conhecer produtos</Link>
      </div>
    );
  }

  return (
    <section className="customer-orders" aria-label="Pedidos">
      {orders.map((order) => {
        const firstItem = order.items[0];
        return (
          <article className="customer-order-card" key={order.id}>
            <header className="customer-order-card__header">
              <div>
                <span>Pedido</span>
                <strong>{order.number}</strong>
              </div>
              <span className={`order-status order-status--${order.status}`}>
                <i aria-hidden="true" />
                {statusLabel(order.status)}
              </span>
            </header>

            <div className="customer-order-card__body">
              <div className="customer-order-product">
                <div
                  className={`customer-order-product__image ${firstItem?.imageSnapshot ? "customer-order-product__image--ready" : ""}`}
                  style={firstItem?.imageSnapshot ? { backgroundImage: `url(${firstItem.imageSnapshot})` } : undefined}
                  role={firstItem?.imageSnapshot ? "img" : undefined}
                  aria-label={firstItem?.imageSnapshot ? firstItem.nameSnapshot : undefined}
                >
                  {firstItem?.imageSnapshot ? null : <Package aria-hidden="true" size={22} />}
                </div>
                <div>
                  <strong>{firstItem?.nameSnapshot ?? "Pedido"}</strong>
                  <span>{order.items.reduce((total, item) => total + item.quantity, 0)} {order.items.length === 1 ? "item" : "itens"}</span>
                  {order.items.length > 1 ? <small>e mais {order.items.length - 1} produto(s)</small> : null}
                </div>
              </div>

              <dl className="customer-order-card__facts">
                <div><CalendarDays aria-hidden="true" size={17} /><dt>Realizado em</dt><dd>{formatDate(order.createdAt)}</dd></div>
                <div><Truck aria-hidden="true" size={17} /><dt>Entrega</dt><dd>{order.shippingSnapshot.label}</dd></div>
                <div><Clock3 aria-hidden="true" size={17} /><dt>{order.status === "aguardando_pagamento" ? "Pague até" : "Atualização"}</dt><dd>{formatDate(order.status === "aguardando_pagamento" ? order.expiresAt : (order.paidAt ?? order.createdAt), true)}</dd></div>
              </dl>

              <div className="customer-order-card__total">
                <span>Total</span>
                <strong>{formatMoney(order.grandTotalCents)}</strong>
              </div>
            </div>

            <footer className="customer-order-card__footer">
              {audience === "customer" && order.status === "aguardando_pagamento" ? (
                <Link className="primary-action" href={`/pedidos/${order.id}/pagamento`}>
                  Continuar pagamento <ChevronRight aria-hidden="true" size={17} />
                </Link>
              ) : (
                <span className="customer-order-card__notice">{customerStatusMessage(order.status)}</span>
              )}
              {audience === "admin" ? <NotificationStatus deliveries={notificationsByOrder[order.id] ?? []} /> : null}
            </footer>
          </article>
        );
      })}
    </section>
  );
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    aguardando_pagamento: "Aguardando pagamento",
    pago: "Pagamento confirmado",
    em_preparacao: "Em preparação",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
    expirado: "Expirado",
    reembolsado: "Reembolsado"
  };
  return labels[status];
}

function customerStatusMessage(status: OrderStatus) {
  const messages: Record<OrderStatus, string> = {
    aguardando_pagamento: "Finalize o pagamento para confirmar sua compra.",
    pago: "Pagamento aprovado. Seu pedido seguirá para preparação.",
    em_preparacao: "Estamos preparando seu pedido com cuidado.",
    enviado: "Seu pedido está a caminho.",
    entregue: "Pedido entregue.",
    cancelado: "Este pedido foi cancelado.",
    expirado: "O prazo de pagamento deste pedido terminou.",
    reembolsado: "O pagamento deste pedido foi reembolsado."
  };
  return messages[status];
}

function formatDate(value: Date, withTime = false) {
  return value.toLocaleString("pt-BR", withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}
