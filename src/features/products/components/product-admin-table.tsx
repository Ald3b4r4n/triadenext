import Link from "next/link";
import { ProductStatusBadge } from "./product-status-badge";
import { formatProductPrice } from "../utils";
import type { Product } from "../types";

type ProductAdminTableProps = {
  products: Product[];
};

export function ProductAdminTable({ products }: ProductAdminTableProps) {
  if (products.length === 0) {
    return (
      <div className="admin-table admin-table--empty" role="status">
        <p className="eyebrow">Produtos</p>
        <h2>Nenhum produto cadastrado</h2>
        <p className="muted">
          Cadastre o primeiro produto para validar a vitrine pública e o fluxo
          de carrinho.
        </p>
        <Link className="primary-action" href="/admin/produtos/novo">
          Novo produto
        </Link>
      </div>
    );
  }

  return (
    <div
      className="admin-table"
      role="table"
      aria-label="Produtos administrativos"
    >
      <div
        className="admin-table__row admin-table__row--head admin-table__row--products"
        role="row"
      >
        <span role="columnheader">Produto</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Estoque</span>
        <span role="columnheader">Preço</span>
        <span role="columnheader">Acoes</span>
      </div>
      {products.map((product) => (
        <div
          className="admin-table__row admin-table__row--products"
          role="row"
          key={product.id}
        >
          <span role="cell">
            <strong>{product.name}</strong>
            <small>{product.sku}</small>
          </span>
          <span role="cell">
            <ProductStatusBadge product={product} />
          </span>
          <span role="cell">{product.stockQuantity}</span>
          <span role="cell">{formatProductPrice(product.priceCents)}</span>
          <span role="cell">
            <Link
              className="text-action"
              href={`/admin/produtos/${product.id}/editar`}
            >
              Editar
            </Link>
          </span>
        </div>
      ))}
    </div>
  );
}
