import Link from "next/link";
import type { PublicProduct } from "../types";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: PublicProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="storefront-empty" role="status">
        <p className="eyebrow">Novidades a caminho</p>
        <h3>Nenhum produto disponível no momento.</h3>
        <p>Nossa seleção está sendo renovada. Volte em breve para descobrir novas fragrâncias.</p>
        <Link className="secondary-action" href="/">
          Voltar para a home
        </Link>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
