import Link from "next/link";
import { ProductAdminTable } from "@/features/products/components/product-admin-table";
import { listAdminProducts } from "@/features/products/server/product-service";

export default async function AdminProdutosPage() {
  const products = await listAdminProducts();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin</p>
        <h1>Produtos</h1>
        <p>
          Listagem administrativa com base de criacao, edicao e persistencia preparada para
          Neon/Drizzle.
        </p>
        <Link className="primary-action" href="/admin/produtos/novo">
          Novo produto
        </Link>
      </section>
      <ProductAdminTable products={products} />
    </main>
  );
}
