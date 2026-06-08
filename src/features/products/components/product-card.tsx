import Link from "next/link";
import type { PublicProduct } from "../types";
import { ProductImage } from "./product-image";
import { ProductPrice } from "./product-price";

type ProductCardProps = {
  product: PublicProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link href={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>
        <ProductImage image={product.coverImage} label={product.name} />
      </Link>
      <div className="product-card__body">
        <p className="muted">{product.categories[0]?.name ?? "Produto"}</p>
        <h2>
          <Link href={`/produto/${product.slug}`}>{product.name}</Link>
        </h2>
        {product.shortDescription ? <p>{product.shortDescription}</p> : null}
        <ProductPrice
          priceCents={product.priceCents}
          compareAtPriceCents={product.compareAtPriceCents}
        />
      </div>
    </article>
  );
}
