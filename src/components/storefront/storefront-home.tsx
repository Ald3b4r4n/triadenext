import Link from "next/link";
import { ProductGrid } from "@/features/products/components/product-grid";
import type { PublicProduct } from "@/features/products/types";

type StorefrontHomeProps = {
  products: PublicProduct[];
  catalogUnavailable?: boolean;
};

export function StorefrontHome({
  products,
  catalogUnavailable = false
}: StorefrontHomeProps) {
  return (
    <main>
      <section className="storefront-hero">
        <div className="page-shell storefront-hero__content">
          <div className="storefront-hero__copy">
            <p className="sr-only">Tríade Essenza Parfum</p>
            <p className="eyebrow">Seu momento. Sua essência.</p>
            <h1 aria-label="Perfumes importados que marcam presença.">
              Perfumes importados
              <br />
              que <span>marcam presença.</span>
            </h1>
            <p className="storefront-hero__lead">
              As melhores fragrâncias masculinas e femininas com qualidade, procedência e
              sofisticação.
            </p>
            <div className="action-row">
              <Link className="primary-action" href="/produtos">
                Ver coleções
              </Link>
              <Link className="secondary-action secondary-action--hero" href="/produtos">
                Mais vendidos
              </Link>
            </div>
          </div>

          <div className="storefront-hero__visual hero-product-scene" aria-hidden="true" />
        </div>
      </section>

      <section className="page-shell storefront-section" aria-labelledby="storefront-products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vitrine da loja</p>
            <h2 id="storefront-products">Perfumes selecionados</h2>
          </div>
          <Link className="section-link" href="/produtos">
            Explorar catálogo
          </Link>
        </div>

        {catalogUnavailable ? (
          <div className="storefront-empty" role="status">
            <p className="eyebrow">Catálogo temporariamente indisponível</p>
            <h3>Nossa curadoria volta em breve.</h3>
            <p>Você pode tentar novamente sem perder nenhum dado da sua sessão.</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>

    </main>
  );
}
