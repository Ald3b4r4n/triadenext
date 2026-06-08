import { ProductGrid } from "@/features/products/components/product-grid";
import { listPublicProducts } from "@/features/products/server/product-service";

export default async function ProdutosPage() {
  const products = await listPublicProducts();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Catalogo</p>
        <h1>Produtos</h1>
        <p>
          Vitrine publica com produtos publicados, data de publicacao valida e estoque positivo.
        </p>
      </section>
      <ProductGrid products={products} />
    </main>
  );
}
