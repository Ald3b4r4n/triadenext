import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Boxes,
  Package,
  ShoppingCart,
  Truck,
  WalletCards
} from "lucide-react";
import { listCouponsAction } from "@/features/coupons/server/admin-coupon-actions";
import { listAdminPendingOrdersAction } from "@/features/orders/server/order-actions";
import {
  listAdminProducts,
  listProductCategories
} from "@/features/products/server/product-service";

type MetricCard = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "gold" | "green" | "blue" | "amber";
  values: number[];
};

type OperationLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const chartValues = [
  0.16, 0.28, 0.22, 0.36, 0.31, 0.48, 0.42, 0.57, 0.52, 0.66, 0.72, 0.69
];

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
    description: "Manter regras manuais por UF ou faixa de CEP.",
    href: "/admin/frete",
    icon: Truck
  }
];

export default async function AdminPage() {
  const [products, categories, couponsResult, ordersResult] = await Promise.all(
    [
      listAdminProducts(),
      listProductCategories(),
      listCouponsAction(),
      listAdminPendingOrdersAction()
    ]
  );

  const coupons =
    couponsResult.status === "success" && couponsResult.coupons
      ? couponsResult.coupons
      : [];
  const orders = ordersResult.status === "success" ? ordersResult.orders : [];
  const activeProducts = products.filter(
    (product) => product.status === "published"
  ).length;
  const activeCoupons = coupons.filter(
    (coupon) => coupon.status === "active"
  ).length;
  const revenueCents = orders.reduce(
    (total, order) => total + order.grandTotalCents,
    0
  );
  const pendingOrders = orders.filter(
    (order) => order.status === "aguardando_pagamento"
  ).length;
  const paidOrders = orders.filter((order) => order.status === "pago").length;
  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelado"
  ).length;

  const metrics: MetricCard[] = [
    {
      title: "Receita total",
      value: formatCurrency(revenueCents),
      detail: `${formatCurrency(averageOrderTicket(revenueCents, orders.length))} ticket médio`,
      icon: WalletCards,
      tone: "gold",
      values: [0.18, 0.24, 0.2, 0.32, 0.28, 0.4, 0.36, 0.48]
    },
    {
      title: "Pedidos",
      value: String(orders.length),
      detail: `${paidOrders} pagos · ${pendingOrders} pendentes`,
      icon: ShoppingCart,
      tone: "blue",
      values: [0.1, 0.16, 0.14, 0.22, 0.2, 0.31, 0.26, 0.37]
    },
    {
      title: "Produtos ativos",
      value: String(activeProducts),
      detail: `${products.length} itens no catálogo`,
      icon: Package,
      tone: "green",
      values: [0.34, 0.36, 0.38, 0.43, 0.46, 0.51, 0.53, 0.58]
    },
    {
      title: "Cupons ativos",
      value: String(activeCoupons),
      detail: `${coupons.length} campanhas cadastradas`,
      icon: BadgePercent,
      tone: "amber",
      values: [0.12, 0.1, 0.18, 0.16, 0.22, 0.24, 0.23, 0.29]
    }
  ];

  const maxProductsGoal = Math.max(12, products.length);
  const productProgress = percentage(activeProducts, maxProductsGoal);
  const categoryProgress = percentage(
    categories.filter((category) => category.isActive).length,
    Math.max(6, categories.length)
  );
  const couponProgress = percentage(activeCoupons, Math.max(4, coupons.length));

  return (
    <main className="admin-dashboard-page">
      <section className="admin-dashboard-heading">
        <div>
          <p>Painel administrativo</p>
          <h1>Dashboard</h1>
          <span>
            Bem-vindo de volta. Aqui está o panorama operacional da loja.
          </span>
        </div>
        <form
          className="admin-dashboard-filters"
          action="/admin"
          aria-label="Filtros do painel"
        >
          <select aria-label="Período" name="period">
            <option>Últimos 30 dias</option>
            <option>Últimos 7 dias</option>
            <option>Este mês</option>
          </select>
          <input
            aria-label="Data inicial"
            name="start"
            placeholder="dd/mm/aaaa"
            type="text"
          />
          <input
            aria-label="Data final"
            name="end"
            placeholder="dd/mm/aaaa"
            type="text"
          />
          <button type="submit">Filtrar</button>
        </form>
      </section>

      <section
        className="admin-metric-grid"
        aria-label="Indicadores principais"
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-panel--wide">
          <div className="admin-panel__header">
            <div>
              <h2>Visão geral</h2>
              <p>Movimento do período filtrado e saúde básica da operação.</p>
            </div>
            <div
              className="admin-segmented-control"
              aria-label="Métrica do gráfico"
            >
              <button type="button" aria-pressed="true">
                Receita
              </button>
              <button type="button">Pedidos</button>
              <button type="button">Catálogo</button>
            </div>
          </div>
          <DashboardChart values={chartValues} />
        </article>

        <aside className="admin-dashboard-side">
          <article className="admin-panel admin-status-panel">
            <div className="admin-panel__header">
              <div>
                <h2>Pedidos por status</h2>
                <p>Distribuição dos pedidos acompanhados no admin.</p>
              </div>
            </div>
            <div className="admin-status-donut" aria-label="Pedidos pendentes">
              <span>{orders.length}</span>
              <small>Pedidos</small>
            </div>
            <ul className="admin-status-list">
              <li>
                <span>Pendente</span>
                <strong>{pendingOrders}</strong>
              </li>
              <li>
                <span>Pago</span>
                <strong>{paidOrders}</strong>
              </li>
              <li>
                <span>Cancelado</span>
                <strong>{cancelledOrders}</strong>
              </li>
            </ul>
          </article>

          <article className="admin-panel admin-goals-panel">
            <div className="admin-panel__header">
              <div>
                <h2>Metas operacionais</h2>
                <p>Indicadores para deixar a loja pronta para venda.</p>
              </div>
              <Link href="/admin/produtos">Editar</Link>
            </div>
            <GoalBar
              label="Produtos publicados"
              value={activeProducts}
              target={maxProductsGoal}
              progress={productProgress}
            />
            <GoalBar
              label="Categorias ativas"
              value={categories.filter((category) => category.isActive).length}
              target={Math.max(6, categories.length)}
              progress={categoryProgress}
            />
            <GoalBar
              label="Cupons ativos"
              value={activeCoupons}
              target={Math.max(4, coupons.length)}
              progress={couponProgress}
            />
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
              <Link
                className="admin-quick-link"
                href={item.href}
                key={item.title}
              >
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
              <h2>Readiness</h2>
              <p>Controles que seguem separados de produção.</p>
            </div>
          </div>
          <ul>
            <li>
              <span>Staging smoke</span>
              <strong>Seguro</strong>
            </li>
            <li>
              <span>Importação controlada</span>
              <strong>Protegida</strong>
            </li>
            <li>
              <span>Produção</span>
              <strong>Bloqueada</strong>
            </li>
          </ul>
        </article>

        <article className="admin-panel admin-inventory-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Catálogo</h2>
              <p>Base atual disponível para revisão.</p>
            </div>
            <Boxes aria-hidden="true" size={22} />
          </div>
          <dl>
            <div>
              <dt>Total de produtos</dt>
              <dd>{products.length}</dd>
            </div>
            <div>
              <dt>Categorias</dt>
              <dd>{categories.length}</dd>
            </div>
            <div>
              <dt>Cupons</dt>
              <dd>{coupons.length}</dd>
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
          <span>{metric.detail}</span>
        </div>
        <metric.icon aria-hidden="true" size={22} />
      </div>
      <Sparkline values={metric.values} />
    </article>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const points = values
    .map(
      (value, index) =>
        `${(index / (values.length - 1)) * 100},${34 - value * 28}`
    )
    .join(" ");

  return (
    <svg
      className="admin-sparkline"
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline points={points} />
    </svg>
  );
}

function DashboardChart({ values }: { values: number[] }) {
  const points = values
    .map(
      (value, index) =>
        `${(index / (values.length - 1)) * 100},${88 - value * 70}`
    )
    .join(" ");

  return (
    <div className="admin-chart" aria-label="Gráfico de visão geral">
      <div className="admin-chart__axis" aria-hidden="true">
        {["1,0", "0,8", "0,6", "0,4", "0,2", "0"].map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points} />
      </svg>
    </div>
  );
}

function GoalBar({
  label,
  value,
  target,
  progress
}: {
  label: string;
  value: number;
  target: number;
  progress: number;
}) {
  return (
    <div className="admin-goal">
      <div>
        <span>{label}</span>
        <strong>{progress}%</strong>
      </div>
      <div className="admin-goal__track">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p>
        {value} de {target}
      </p>
    </div>
  );
}

function averageOrderTicket(totalCents: number, ordersCount: number) {
  if (ordersCount === 0) {
    return 0;
  }

  return Math.round(totalCents / ordersCount);
}

function percentage(value: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / target) * 100));
}

function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency"
  }).format(valueInCents / 100);
}
