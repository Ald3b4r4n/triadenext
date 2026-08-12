import Link from "next/link";
import {
  ChevronRight,
  CircleUserRound,
  Clock3,
  LogOut,
  Mail,
  PackageCheck,
  ShoppingBag
} from "lucide-react";
import { logoutAction } from "@/features/auth/server/actions";
import { getCurrentSession } from "@/features/auth/server/session";
import { listCustomerPendingOrdersAction } from "@/features/orders/server/order-actions";
import { formatMoney } from "@/lib/money";

export default async function MinhaContaPage() {
  const [session, orderResult] = await Promise.all([
    getCurrentSession(),
    listCustomerPendingOrdersAction()
  ]);
  const orders = orderResult.status === "success" ? orderResult.orders : [];
  const recentOrders = [...orders]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 3);
  const paidOrders = orders.filter((order) =>
    ["pago", "em_preparacao", "enviado", "entregue"].includes(order.status)
  ).length;
  const pendingOrders = orders.filter((order) => order.status === "aguardando_pagamento").length;
  const email = session.status === "authenticated" ? session.email : "";
  const displayName = session.status === "authenticated"
    ? session.name?.trim() || session.email.split("@")[0]
    : "Cliente";
  const firstName = displayName.split(/\s+/)[0];
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="page-shell account-page">
      <section className="account-hero">
        <div className="account-avatar" aria-hidden="true">{initials || "C"}</div>
        <div className="account-hero__content">
          <p className="muted">Minha conta</p>
          <h1>Olá, {firstName}</h1>
          <p>Gerencie seus pedidos e acompanhe cada etapa da sua compra.</p>
          <span className="account-session"><Mail aria-hidden="true" size={15} /> {email}</span>
        </div>
        <form action={logoutAction}>
          <button className="account-logout" type="submit">
            <LogOut aria-hidden="true" size={17} /> Sair da conta
          </button>
        </form>
      </section>

      <section className="account-metrics" aria-label="Resumo da conta">
        <div><ShoppingBag aria-hidden="true" size={20} /><span>Pedidos</span><strong>{orders.length}</strong></div>
        <div><PackageCheck aria-hidden="true" size={20} /><span>Confirmados</span><strong>{paidOrders}</strong></div>
        <div><Clock3 aria-hidden="true" size={20} /><span>Aguardando pagamento</span><strong>{pendingOrders}</strong></div>
      </section>

      <div className="account-layout">
        <section className="account-recent" aria-labelledby="account-recent-title">
          <header>
            <div>
              <h2 id="account-recent-title">Pedidos recentes</h2>
              <p>Acompanhe pagamentos, preparação e envio.</p>
            </div>
            <Link href="/pedidos">Ver todos <ChevronRight aria-hidden="true" size={16} /></Link>
          </header>
          {recentOrders.length > 0 ? (
            <div className="account-order-list">
              {recentOrders.map((order) => (
                <Link
                  className="account-order-row"
                  href={order.status === "aguardando_pagamento" ? `/pedidos/${order.id}/pagamento` : "/pedidos"}
                  key={order.id}
                >
                  <div>
                    <small>{order.number}</small>
                    <strong>{order.items[0]?.nameSnapshot ?? "Pedido"}</strong>
                    <span>{formatAccountDate(order.createdAt)}</span>
                  </div>
                  <div className="account-order-row__status">
                    <span className={`order-status order-status--${order.status}`}>{accountStatusLabel(order.status)}</span>
                    <strong>{formatMoney(order.grandTotalCents)}</strong>
                  </div>
                  <ChevronRight aria-hidden="true" size={18} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="account-empty">
              <ShoppingBag aria-hidden="true" size={24} />
              <div><strong>Você ainda não fez pedidos</strong><p>Conheça nossas fragrâncias e encontre a sua próxima assinatura.</p></div>
              <Link className="primary-action" href="/produtos">Ver produtos</Link>
            </div>
          )}
        </section>

        <aside className="account-sidebar" aria-label="Dados e atalhos da conta">
          <section>
            <CircleUserRound aria-hidden="true" size={23} />
            <div><h2>Dados de acesso</h2><p>Sua sessão está ativa e protegida.</p></div>
            <dl>
              <div><dt>Nome</dt><dd>{displayName}</dd></div>
              <div><dt>E-mail</dt><dd>{email}</dd></div>
              <div><dt>Perfil</dt><dd>{session.status === "authenticated" ? roleLabel(session.role) : "Cliente"}</dd></div>
            </dl>
          </section>
          <nav aria-label="Atalhos da conta">
            <Link href="/pedidos"><span>Meus pedidos</span><ChevronRight aria-hidden="true" size={17} /></Link>
            <Link href="/enderecos"><span>Meus endereços</span><ChevronRight aria-hidden="true" size={17} /></Link>
            <Link href="/carrinho"><span>Meu carrinho</span><ChevronRight aria-hidden="true" size={17} /></Link>
          </nav>
        </aside>
      </div>
    </main>
  );
}

function formatAccountDate(value: Date) {
  return value.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function accountStatusLabel(status: string) {
  const labels: Record<string, string> = {
    aguardando_pagamento: "Aguardando pagamento",
    pago: "Pagamento confirmado",
    em_preparacao: "Em preparação",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
    expirado: "Expirado",
    reembolsado: "Reembolsado"
  };
  return labels[status] ?? status;
}

function roleLabel(role: string) {
  return role === "admin" ? "Administrador" : role === "manager" ? "Gerente" : "Cliente";
}
