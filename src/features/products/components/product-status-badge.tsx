import type { Product } from "../types";

type ProductStatusBadgeProps = {
  product: Product;
};

export function ProductStatusBadge({ product }: ProductStatusBadgeProps) {
  const labels = {
    draft: "Rascunho",
    published: "Publicado",
    inactive: "Inativo"
  } satisfies Record<Product["status"], string>;

  return <span className={`status-badge status-badge--${product.status}`}>{labels[product.status]}</span>;
}
