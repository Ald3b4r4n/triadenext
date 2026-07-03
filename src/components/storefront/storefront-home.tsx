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
            <p className="storefront-hero__brand">Tríade Essenza Parfum</p>
            <p className="eyebrow">Perfumaria árabe contemporânea</p>
            <h1>Perfumes que vestem presença.</h1>
            <p className="storefront-hero__lead">
              Uma vitrine elegante de fragrâncias intensas, com acordes orientais, assinatura
              marcante e compra guiada para escolher sem pressa.
            </p>
            <div className="action-row">
              <Link className="primary-action" href="/produtos">
                Comprar agora
              </Link>
              <Link className="hero-text-link" href="/carrinho">
                Ir para o carrinho
              </Link>
            </div>
          </div>

          <div className="storefront-hero__visual" aria-hidden="true">
            <span className="storefront-hero__halo" />
            <div className="storefront-bottle">
              <span className="storefront-bottle__cap" />
              <span className="storefront-bottle__label">
                <small>Tríade</small>
                Essenza
              </span>
            </div>
            <p>Essências intensas. Elegância sem excessos.</p>
          </div>
        </div>
      </section>

      <section className="page-shell storefront-section" aria-labelledby="storefront-products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vitrine da loja</p>
            <h2 id="storefront-products">Destaques para uma assinatura marcante</h2>
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

      <section className="storefront-promise">
        <div className="page-shell storefront-promise__grid">
          <article>
            <span>01</span>
            <h2>Curadoria com personalidade</h2>
            <p>Perfumes selecionados para quem procura intensidade, identidade e acabamento.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Compra simples e segura</h2>
            <p>Do catálogo ao carrinho, você acompanha cada etapa antes de finalizar o pedido.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Detalhes que permanecem</h2>
            <p>Apresentação elegante e fragrâncias criadas para deixar uma memória duradoura.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
