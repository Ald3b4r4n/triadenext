import { ProductGrid } from "@/features/products/components/product-grid";
import { listPublicProducts } from "@/features/products/server/product-service";

export default async function ProdutosPage() {
  const products = await listPublicProducts();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Catálogo</p>
        <h1>Produtos</h1>
        <p>
          Fragrâncias disponíveis para compra, com estoque e publicação ativos.
        </p>
      </section>
      <ProductGrid products={products} />
    </main>
  );
}
