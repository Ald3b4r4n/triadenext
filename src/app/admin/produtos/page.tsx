import Link from "next/link";
import { ProductAdminTable } from "@/features/products/components/product-admin-table";
import {
  getProductRuntimeMode,
  listAdminProducts
} from "@/features/products/server/product-service";

export default async function AdminProdutosPage() {
  const [products, runtimeMode] = await Promise.all([listAdminProducts(), getProductRuntimeMode()]);

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
      <AdminRuntimeNotices
        databaseNotice={runtimeMode.databaseNotice}
        authNotice={runtimeMode.adminAuthNotice}
      />
      <ProductAdminTable products={products} />
    </main>
  );
}

function AdminRuntimeNotices({
  databaseNotice,
  authNotice
}: {
  databaseNotice: string | null;
  authNotice: string | null;
}) {
  return (
    <section className="form-panel">
      {databaseNotice ? <p className="form-message form-message--error">{databaseNotice}</p> : null}
      {authNotice ? <p className="form-message form-message--success">{authNotice}</p> : null}
    </section>
  );
}
