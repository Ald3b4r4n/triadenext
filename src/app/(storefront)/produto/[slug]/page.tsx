import { notFound } from "next/navigation";
import { CreditCard, PackageCheck, ShieldCheck, Truck } from "lucide-react";
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
    <main className="page-shell product-page">
      <section className="product-detail">
        <ProductImage image={product.coverImage} label={product.name} />
        <div className="product-detail__content">
          <p className="product-detail__brand">{product.brand ?? product.categories[0]?.name ?? "Perfumes"}</p>
          <h1>{product.name}</h1>
          {product.shortDescription ? <p>{product.shortDescription}</p> : null}
          <ProductPrice
            priceCents={product.priceCents}
            compareAtPriceCents={product.compareAtPriceCents}
          />
          <dl className="product-facts">
            <div>
              <dt>Volume</dt>
              <dd>{product.volumeMl ? `${product.volumeMl} ml` : "Não informado"}</dd>
            </div>
            <div>
              <dt>Estoque</dt>
              <dd>Disponível</dd>
            </div>
          </dl>
          <AddToCartForm productId={product.id} />
          <ul className="product-purchase-assurances" aria-label="Informações da compra">
            <li><ShieldCheck aria-hidden="true" size={18} /><span><strong>Compra segura</strong>Pagamento protegido</span></li>
            <li><Truck aria-hidden="true" size={18} /><span><strong>Entrega nacional</strong>Frete calculado no carrinho</span></li>
            <li><PackageCheck aria-hidden="true" size={18} /><span><strong>Produto original</strong>Procedência garantida</span></li>
            <li><CreditCard aria-hidden="true" size={18} /><span><strong>Cartão de crédito</strong>Processado em ambiente seguro</span></li>
          </ul>
        </div>
      </section>
      {product.description ? (
        <section className="product-description" aria-labelledby="product-description-title">
          <h2 id="product-description-title">Sobre a fragrância</h2>
          <p>{product.description}</p>
        </section>
      ) : null}
    </main>
  );
}
