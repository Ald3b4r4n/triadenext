import { ProductStatusBadge } from "@/features/products/components/product-status-badge";
import { formatProductPrice } from "@/features/products/utils";
import { listAdminProducts } from "@/features/products/server/product-service";

export default async function AdminProdutosPage() {
  const products = await listAdminProducts();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin</p>
        <h1>Produtos</h1>
        <p>
          Estrutura inicial de leitura para catalogo. Criacao, edicao, persistencia Neon e upload
          real entram na proxima fase.
        </p>
      </section>
      <div className="admin-table" role="table" aria-label="Produtos administrativos">
        <div className="admin-table__row admin-table__row--head" role="row">
          <span role="columnheader">Produto</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Estoque</span>
          <span role="columnheader">Preco</span>
        </div>
        {products.map((product) => (
          <div className="admin-table__row" role="row" key={product.id}>
            <span role="cell">
              <strong>{product.name}</strong>
              <small>{product.sku}</small>
            </span>
            <span role="cell">
              <ProductStatusBadge product={product} />
            </span>
            <span role="cell">{product.stockQuantity}</span>
            <span role="cell">{formatProductPrice(product.priceCents)}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
