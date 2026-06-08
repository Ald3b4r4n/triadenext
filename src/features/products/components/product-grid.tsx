import type { PublicProduct } from "../types";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: PublicProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="muted">Nenhum produto publico disponivel no momento.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
