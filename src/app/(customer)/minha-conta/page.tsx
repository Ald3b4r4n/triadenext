import Link from "next/link";

export default function MinhaContaPage() {
  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Área do cliente</p>
        <h1>Minha conta</h1>
        <p>
          Acompanhe seus pedidos e continue sua compra. Perfil completo e preferências ficam para
          uma etapa futura.
        </p>
      </section>

      <section className="account-grid" aria-label="Atalhos da conta">
        <Link className="account-card" href="/pedidos">
          <span>Pedidos</span>
          <p>Veja pedidos pendentes, pagos e próximos passos de pagamento.</p>
        </Link>
        <Link className="account-card" href="/enderecos">
          <span>Endereços</span>
          <p>Confira o estado atual da área de endereços antes do cadastro completo.</p>
        </Link>
        <Link className="account-card" href="/carrinho">
          <span>Carrinho</span>
          <p>Retome sua seleção de fragrâncias.</p>
        </Link>
      </section>
    </main>
  );
}
