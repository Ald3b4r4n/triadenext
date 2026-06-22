import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin</p>
        <h1>Painel operacional</h1>
        <p>
          Acompanhe as áreas essenciais da loja sem executar ações financeiras, fiscais ou
          integrações externas nesta fase.
        </p>
      </section>

      <section className="admin-dashboard" aria-label="Atalhos administrativos">
        <AdminCard href="/admin/produtos" title="Produtos" text="Catálogo, imagens e publicação." />
        <AdminCard href="/admin/cupons" title="Cupons" text="Descontos globais do carrinho." />
        <AdminCard href="/admin/frete" title="Frete" text="Regras manuais por UF ou CEP." />
        <AdminCard href="/admin/pedidos" title="Pedidos" text="Status de pedido, pagamento e notificações." />
      </section>
    </main>
  );
}

function AdminCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link className="admin-card" href={href}>
      <span>{title}</span>
      <p>{text}</p>
    </Link>
  );
}
