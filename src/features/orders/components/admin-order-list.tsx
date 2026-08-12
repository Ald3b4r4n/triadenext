import {
  Bell,
  CalendarClock,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  Truck
} from "lucide-react";
import { Trash2 } from "lucide-react";
import { deleteExpiredOrderAction } from "../server/order-actions";
import { NotificationStatus } from "@/features/notifications/components/notification-status";
import type { NotificationDelivery } from "@/features/notifications/types";
import { formatMoney } from "@/lib/money";
import type { OrderStatus, PendingOrder } from "../types";

export function AdminOrderList({ orders, notificationsByOrder }: {
  orders: PendingOrder[];
  notificationsByOrder: Record<string, NotificationDelivery[]>;
}) {
  if (orders.length === 0) {
    return (
      <div className="placeholder-panel">
        <ShoppingBag aria-hidden="true" size={24} />
        <h2>Nenhum pedido encontrado</h2>
        <p>Os novos pedidos aparecerão aqui para acompanhamento.</p>
      </div>
    );
  }

  const confirmedStatuses: OrderStatus[] = ["pago", "em_preparacao", "enviado", "entregue"];
  const paidOrders = orders.filter((order) => confirmedStatuses.includes(order.status));
  const pendingOrders = orders.filter((order) => order.status === "aguardando_pagamento");
  const readyToShip = orders.filter((order) => order.status === "pago" || order.status === "em_preparacao");
  const receivedCents = paidOrders.reduce((total, order) => total + order.grandTotalCents, 0);
  const monthlyHistory = buildMonthlyHistory(paidOrders);

  return (
    <>
      <section className="admin-order-overview" aria-label="Resumo dos pedidos">
        <div><ShoppingBag aria-hidden="true" size={20} /><span>Pedidos</span><strong>{orders.length}</strong></div>
        <div><Clock3 aria-hidden="true" size={20} /><span>Aguardando</span><strong>{pendingOrders.length}</strong></div>
        <div><Truck aria-hidden="true" size={20} /><span>Para expedir</span><strong>{readyToShip.length}</strong></div>
        <div><PackageCheck aria-hidden="true" size={20} /><span>Recebido</span><strong>{formatMoney(receivedCents)}</strong></div>
      </section>

      <section className="admin-order-monthly" aria-labelledby="monthly-orders-title">
        <header><div><p className="muted">Histórico preservado</p><h2 id="monthly-orders-title">Pedidos aprovados por mês</h2></div><span>Registros pagos não podem ser excluídos.</span></header>
        <div>{monthlyHistory.map((month) => <article key={month.key}><span>{month.label}</span><strong>{formatMoney(month.totalCents)}</strong><small>{month.orders} {month.orders === 1 ? "pedido" : "pedidos"}</small></article>)}</div>
      </section>

      <section className="admin-order-list" aria-label="Pedidos">
        <header className="admin-order-list__header">
          <div>
            <h2>Fila operacional</h2>
            <p>Pagamento, dados do cliente, separação e estratégia de envio.</p>
          </div>
          <span>{orders.length} {orders.length === 1 ? "registro" : "registros"}</span>
        </header>

        <div className="admin-order-cards">
          {orders.map((order) => (
            <details className="admin-order-card" key={order.id}>
              <summary>
                <div className="admin-order-card__identity">
                  <strong>{order.number}</strong>
                  <span>{order.customerSnapshot.fullName}</span>
                </div>
                <span className={`order-status order-status--${order.status}`}><i aria-hidden="true" />{statusLabel(order.status)}</span>
                <div className="admin-order-card__shipping">
                  <Truck aria-hidden="true" size={17} />
                  <span>{order.shippingSnapshot.label}</span>
                  <small>{order.shippingSnapshot.estimatedDays ? `${order.shippingSnapshot.estimatedDays} dias úteis` : "Prazo a confirmar"}</small>
                </div>
                <div className="admin-order-card__date">
                  <CalendarClock aria-hidden="true" size={16} />
                  <span>{formatDate(order.createdAt)}</span>
                  {order.status === "aguardando_pagamento" ? <small>Expira {formatTime(order.expiresAt)}</small> : null}
                </div>
                <strong className="admin-order-card__total">{formatMoney(order.grandTotalCents)}</strong>
                <ChevronDown className="admin-order-card__chevron" aria-hidden="true" size={20} />
              </summary>

              <div className="admin-order-card__details">
                <section>
                  <h3>Cliente e entrega</h3>
                  <address>
                    <p><MapPin aria-hidden="true" size={16} /><span><strong>{order.shippingAddressSnapshot.recipient}</strong>{formatAddress(order)}</span></p>
                    <p><Phone aria-hidden="true" size={16} /><span>{order.customerSnapshot.phone}</span></p>
                    <p><Mail aria-hidden="true" size={16} /><span>{order.customerSnapshot.email}</span></p>
                  </address>
                </section>

                <section>
                  <h3>Produtos para separação</h3>
                  <div className="admin-order-products">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        <span
                          className={`admin-order-product__image ${item.imageSnapshot ? "admin-order-product__image--ready" : ""}`}
                          style={item.imageSnapshot ? { backgroundImage: `url(${item.imageSnapshot})` } : undefined}
                        />
                        <p><strong>{item.quantity}× {item.nameSnapshot}</strong><small>SKU: {item.skuSnapshot}</small></p>
                        <strong>{formatMoney(item.lineTotalCents)}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="admin-shipping-plan">
                  <h3>Plano de expedição</h3>
                  <dl>
                    <div><dt>Integração</dt><dd>{providerLabel(order.shippingSnapshot.provider)}</dd></div>
                    <div><dt>Serviço escolhido</dt><dd>{order.shippingSnapshot.label}</dd></div>
                    <div><dt>Frete cobrado</dt><dd>{formatMoney(order.shippingSnapshot.effectiveAmountCents)}</dd></div>
                    <div><dt>Próxima ação</dt><dd>{nextShippingAction(order.status)}</dd></div>
                  </dl>
                  <p className="admin-shipping-plan__note">A compra e a emissão da etiqueta exigem confirmação administrativa no Melhor Envio; nenhuma etiqueta é comprada automaticamente.</p>
                </section>

                <section className="admin-order-card__communication">
                  <h3><Bell aria-hidden="true" size={17} /> Comunicação</h3>
                  <NotificationStatus deliveries={notificationsByOrder[order.id] ?? []} />
                </section>
                {canDeleteExpiredOrder(order) ? (
                  <section className="admin-order-card__danger">
                    <div><h3>Pedido expirado</h3><p>Exclua este registro sem afetar o histórico de pedidos aprovados.</p></div>
                    <form action={deleteExpiredOrderAction}><input type="hidden" name="orderId" value={order.id} /><button type="submit"><Trash2 aria-hidden="true" size={16} /> Excluir pedido</button></form>
                  </section>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function canDeleteExpiredOrder(order: PendingOrder) {
  return order.status === "expirado" || (order.status === "aguardando_pagamento" && order.expiresAt.getTime() <= Date.now());
}

function buildMonthlyHistory(orders: PendingOrder[]) {
  const months = new Map<string, { key: string; label: string; orders: number; totalCents: number }>();
  for (const order of orders) {
    const date = order.paidAt ?? order.createdAt;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = months.get(key) ?? { key, label: date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }), orders: 0, totalCents: 0 };
    current.orders += 1;
    current.totalCents += order.grandTotalCents;
    months.set(key, current);
  }
  return [...months.values()].sort((a, b) => b.key.localeCompare(a.key));
}

function formatAddress(order: PendingOrder) {
  const address = order.shippingAddressSnapshot;
  return `${address.street}, ${address.number}${address.complement ? ` — ${address.complement}` : ""}\n${address.district} — ${address.city}/${address.state}\nCEP ${address.postalCode}`;
}

function providerLabel(provider: PendingOrder["shippingSnapshot"]["provider"]) {
  return provider === "melhor_envio" ? "Melhor Envio" : provider === "manual" ? "Regra manual" : provider;
}

function nextShippingAction(status: OrderStatus) {
  const actions: Record<OrderStatus, string> = {
    aguardando_pagamento: "Aguardar confirmação do pagamento",
    pago: "Conferir dimensões e preparar a etiqueta",
    em_preparacao: "Embalar e emitir a etiqueta",
    enviado: "Acompanhar rastreamento",
    entregue: "Expedição concluída",
    cancelado: "Nenhuma ação de envio",
    expirado: "Nenhuma ação de envio",
    reembolsado: "Verificar eventual logística reversa"
  };
  return actions[status];
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    aguardando_pagamento: "Aguardando pagamento", pago: "Pago", em_preparacao: "Em preparação",
    enviado: "Enviado", entregue: "Entregue", cancelado: "Cancelado", expirado: "Expirado", reembolsado: "Reembolsado"
  };
  return labels[status];
}

function formatDate(value: Date) {
  return value.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value: Date) {
  return value.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
