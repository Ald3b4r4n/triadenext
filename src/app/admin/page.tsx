import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgePercent,
  Boxes,
  Clock3,
  ImageOff,
  Package,
  ShoppingCart,
  Truck,
  WalletCards
} from "lucide-react";
import { listCouponsAction } from "@/features/coupons/server/admin-coupon-actions";
import { listAdminPendingOrdersAction } from "@/features/orders/server/order-actions";
import type { OrderStatus, PendingOrder } from "@/features/orders/types";
import {
  listAdminProducts,
  listProductCategories
} from "@/features/products/server/product-service";
import { getRuntimeMode } from "@/lib/runtime-mode";

type MetricCard = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "gold" | "green" | "blue" | "amber";
};

type OperationLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const operationLinks: OperationLink[] = [
  {
    title: "Produtos",
    description: "Cadastrar, revisar imagens e ajustar publicação.",
    href: "/admin/produtos",
    icon: Package
  },
  {
    title: "Pedidos",
    description: "Acompanhar pagamento, status e notificações.",
    href: "/admin/pedidos",
    icon: ShoppingCart
  },
  {
    title: "Cupons",
    description: "Controlar descontos elegíveis no carrinho.",
    href: "/admin/cupons",
    icon: BadgePercent
  },
  {
    title: "Frete",
    description: "Manter regras de envio e faixas de atendimento.",
    href: "/admin/frete",
    icon: Truck
  }
];

const confirmedRevenueStatuses: OrderStatus[] = [
  "pago",
  "em_preparacao",
  "enviado",
  "entregue"
];

export default async function AdminPage() {
  const [products, categories, couponsResult, ordersResult] = await Promise.all([
    listAdminProducts(),
    listProductCategories(),
    listCouponsAction(),
    listAdminPendingOrdersAction()
  ]);

  const coupons =
    couponsResult.status === "success" && couponsResult.coupons
      ? couponsResult.coupons
      : [];
  const orders = ordersResult.status === "success" ? ordersResult.orders : [];
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const activeProducts = products.filter(
    (product) => product.status === "published"
  ).length;
  const draftProducts = products.filter(
    (product) => product.status !== "published"
  ).length;
  const activeCoupons = coupons.filter(
    (coupon) => coupon.status === "active"
  ).length;
  const confirmedOrders = orders.filter((order) =>
    confirmedRevenueStatuses.includes(order.status)
  );
  const revenueCents = confirmedOrders.reduce(
    (total, order) => total + order.grandTotalCents,
    0
  );
  const pendingOrders = orders.filter(
    (order) => order.status === "aguardando_pagamento"
  ).length;
  const cancelledOrders = orders.filter((order) =>
    ["cancelado", "expirado", "reembolsado"].includes(order.status)
  ).length;
  const lowStockProducts = products.filter(
    (product) => product.stockQuantity <= product.lowStockThreshold
  );
  const productsWithoutImage = products.filter(
    (product) => product.images.length === 0
  );
  const runtime = getRuntimeMode();

  const metrics: MetricCard[] = [
    {
      title: "Receita confirmada",
      value: formatCurrency(revenueCents),
      detail:
        confirmedOrders.length === 0
          ? "Nenhum pagamento confirmado"
          : `${formatCurrency(averageOrderTicket(revenueCents, confirmedOrders.length))} de ticket médio`,
      icon: WalletCards,
      tone: "gold"
    },
    {
      title: "Pedidos",
      value: String(orders.length),
      detail: `${confirmedOrders.length} confirmados · ${pendingOrders} aguardando`,
      icon: ShoppingCart,
      tone: "blue"
    },
    {
      title: "Produtos publicados",
      value: String(activeProducts),
      detail: `${products.length} produtos · ${draftProducts} fora da vitrine`,
      icon: Package,
      tone: "green"
    },
    {
      title: "Estoque em atenção",
      value: String(lowStockProducts.length),
      detail:
        lowStockProducts.length === 0
          ? "Nenhum item no limite mínimo"
          : "Produtos no limite ou sem estoque",
      icon: AlertTriangle,
      tone: "amber"
    }
  ];

  const statusRows = [
    { label: "Aguardando pagamento", value: pendingOrders, tone: "pending" },
    {
      label: "Confirmados",
      value: confirmedOrders.length,
      tone: "confirmed"
    },
    { label: "Cancelados ou expirados", value: cancelledOrders, tone: "cancelled" }
  ];

  return (
    <main className="admin-dashboard-page">
      <section className="admin-dashboard-heading">
        <div>
          <p>Painel administrativo</p>
          <h1>Visão operacional</h1>
          <span>
            Dados atuais de pedidos, catálogo e infraestrutura do staging.
          </span>
        </div>
        <Link className="admin-dashboard-primary-action" href="/admin/pedidos">
          Ver todos os pedidos
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </section>

      <section className="admin-metric-grid" aria-label="Indicadores principais">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-recent-orders">
          <div className="admin-panel__header">
            <div>
              <h2>Pedidos recentes</h2>
              <p>Últimos registros recebidos, sem projeções ou dados simulados.</p>
            </div>
            <Link href="/admin/pedidos">Abrir pedidos</Link>
          </div>
          <RecentOrders orders={recentOrders} />
        </article>

        <aside className="admin-dashboard-side">
          <article className="admin-panel admin-status-panel">
            <div className="admin-panel__header">
              <div>
                <h2>Distribuição dos pedidos</h2>
                <p>Participação real de cada grupo no total atual.</p>
              </div>
              <strong className="admin-panel__total">{orders.length}</strong>
            </div>
            <div className="admin-status-bars">
              {statusRows.map((row) => (
                <StatusBar
                  key={row.label}
                  {...row}
                  total={orders.length}
                />
              ))}
            </div>
          </article>

          <article className="admin-panel admin-attention-panel">
            <div className="admin-panel__header">
              <div>
                <h2>Atenção operacional</h2>
                <p>Pendências que podem exigir uma ação administrativa.</p>
              </div>
            </div>
            <ul>
              <AttentionItem
                href="/admin/pedidos"
                icon={Clock3}
                label="Aguardando pagamento"
                value={pendingOrders}
              />
              <AttentionItem
                href="/admin/produtos"
                icon={AlertTriangle}
                label="Estoque baixo ou zerado"
                value={lowStockProducts.length}
              />
              <AttentionItem
                href="/admin/produtos"
                icon={ImageOff}
                label="Produtos sem imagem"
                value={productsWithoutImage.length}
              />
            </ul>
          </article>
        </aside>
      </section>

      <section className="admin-lower-grid">
        <article className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Acesso rápido</h2>
              <p>Funções principais para operar a loja.</p>
            </div>
          </div>
          <div className="admin-quick-grid">
            {operationLinks.map((item) => (
              <Link className="admin-quick-link" href={item.href} key={item.title}>
                <item.icon aria-hidden="true" size={18} />
                <span>{item.title}</span>
                <small>{item.description}</small>
              </Link>
            ))}
          </div>
        </article>

        <article className="admin-panel admin-readiness-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Ambiente</h2>
              <p>Controles efetivos do projeto dedicado de staging.</p>
            </div>
          </div>
          <ul>
            <li>
              <span>Banco exclusivo</span>
              <strong>{runtime.isDedicatedStagingTarget ? "Conectado" : "Bloqueado"}</strong>
            </li>
            <li>
              <span>Upload de imagens</span>
              <strong>{runtime.hasBlobToken ? "Ativo" : "Indisponível"}</strong>
            </li>
            <li>
              <span>Produção real</span>
              <strong>Não conectada</strong>
            </li>
          </ul>
        </article>

        <article className="admin-panel admin-inventory-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Catálogo</h2>
              <p>Base disponível para operação e revisão.</p>
            </div>
            <Boxes aria-hidden="true" size={22} />
          </div>
          <dl>
            <div>
              <dt>Produtos</dt>
              <dd>{products.length}</dd>
            </div>
            <div>
              <dt>Categorias ativas</dt>
              <dd>{categories.filter((category) => category.isActive).length}</dd>
            </div>
            <div>
              <dt>Cupons ativos</dt>
              <dd>{activeCoupons}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}

function MetricCard({ metric }: { metric: MetricCard }) {
  return (
    <article className={`admin-metric-card admin-metric-card--${metric.tone}`}>
      <div className="admin-metric-card__top">
        <div>
          <p>{metric.title}</p>
          <strong>{metric.value}</strong>
        </div>
        <metric.icon aria-hidden="true" size={22} />
      </div>
      <span className="admin-metric-card__detail">{metric.detail}</span>
    </article>
  );
}

function RecentOrders({ orders }: { orders: PendingOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="admin-dashboard-empty">
        <ShoppingCart aria-hidden="true" size={24} />
        <strong>Nenhum pedido recebido</strong>
        <span>Os pedidos aparecerão aqui após a conclusão do checkout.</span>
      </div>
    );
  }

  return (
    <div className="admin-recent-orders__table">
      <div className="admin-recent-orders__head" aria-hidden="true">
        <span>Pedido</span>
        <span>Cliente</span>
        <span>Status</span>
        <span>Total</span>
      </div>
      {orders.map((order) => (
        <div className="admin-recent-orders__row" key={order.id}>
          <div>
            <strong>{order.number}</strong>
            <small>{formatDate(order.createdAt)}</small>
          </div>
          <span>{order.customerSnapshot.fullName}</span>
          <span className={`order-status order-status--${order.status}`}>
            {statusLabel(order.status)}
          </span>
          <strong>{formatCurrency(order.grandTotalCents)}</strong>
        </div>
      ))}
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  tone
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="admin-status-bar">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div
        className="admin-status-bar__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <span className={`admin-status-bar__fill admin-status-bar__fill--${tone}`} style={{ width: `${percentage}%` }} />
      </div>
      <small>{percentage}% do total</small>
    </div>
  );
}

function AttentionItem({
  href,
  icon: Icon,
  label,
  value
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <li>
      <Link href={href}>
        <Icon aria-hidden="true" size={17} />
        <span>{label}</span>
        <strong>{value}</strong>
        <ArrowUpRight aria-hidden="true" size={15} />
      </Link>
    </li>
  );
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    aguardando_pagamento: "Aguardando",
    pago: "Pago",
    em_preparacao: "Em preparação",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
    expirado: "Expirado",
    reembolsado: "Reembolsado"
  };

  return labels[status];
}

function formatDate(value: Date) {
  return value.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  });
}

function averageOrderTicket(totalCents: number, ordersCount: number) {
  return ordersCount === 0 ? 0 : Math.round(totalCents / ordersCount);
}

function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency"
  }).format(valueInCents / 100);
}
