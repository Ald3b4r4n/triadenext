import Link from "next/link";

export default function EnderecosPage() {
  return (
    <main className="page-shell">
      <section className="placeholder-panel">
        <p className="eyebrow">Endereços</p>
        <h1>Endereços de entrega</h1>
        <p>
          O endereço final ainda é informado no checkout para preservar o resumo do pedido.
          Cadastro de endereços favoritos fica para uma etapa futura.
        </p>
        <div className="action-row">
          <Link className="primary-action" href="/carrinho">
            Ir para o carrinho
          </Link>
          <Link className="secondary-action" href="/pedidos">
            Ver pedidos
          </Link>
        </div>
      </section>
    </main>
  );
}
