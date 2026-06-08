import { notFound } from "next/navigation";
import { AddToCartForm } from "@/features/cart/components/add-to-cart-form";
import { ProductImage } from "@/features/products/components/product-image";
import { ProductPrice } from "@/features/products/components/product-price";
import { getPublicProductBySlug } from "@/features/products/server/product-service";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProdutoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (product === null) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="product-detail">
        <ProductImage image={product.coverImage} label={product.name} />
        <div className="product-detail__content">
          <p className="muted">{product.categories[0]?.name ?? "Produto"}</p>
          <h1>{product.name}</h1>
          {product.shortDescription ? <p>{product.shortDescription}</p> : null}
          <ProductPrice
            priceCents={product.priceCents}
            compareAtPriceCents={product.compareAtPriceCents}
          />
          <dl className="product-facts">
            <div>
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            <div>
              <dt>Volume</dt>
              <dd>{product.volumeMl ? `${product.volumeMl} ml` : "Nao informado"}</dd>
            </div>
            <div>
              <dt>Estoque</dt>
              <dd>Disponivel</dd>
            </div>
          </dl>
          <AddToCartForm productId={product.id} />
          {product.description ? <p>{product.description}</p> : null}
        </div>
      </section>
    </main>
  );
}
