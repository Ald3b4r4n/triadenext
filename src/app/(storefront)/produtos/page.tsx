import { ProductGrid } from "@/features/products/components/product-grid";
import { listPublicProducts } from "@/features/products/server/product-service";

export default async function ProdutosPage() {
  const products = await listPublicProducts();

  return (
    <main className="page-shell catalog-page">
      <section className="page-intro">
        <p className="muted">Catálogo</p>
        <h1>Produtos</h1>
        <p>
          Vitrine da loja com fragrâncias selecionadas, preços em BRL e disponibilidade atual.
        </p>
      </section>
      <ProductGrid products={products} />
    </main>
  );
}
