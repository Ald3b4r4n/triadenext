import { notFound } from "next/navigation";
import { ProductForm } from "@/features/products/components/product-form";
import { updateProductAction } from "@/features/products/server/product-actions";
import {
  getProductRuntimeMode,
  getAdminProductById,
  listProductCategories
} from "@/features/products/server/product-service";

type EditarProdutoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProdutoPage({ params }: EditarProdutoPageProps) {
  const { id } = await params;
  const [product, categories, runtimeMode] = await Promise.all([
    getAdminProductById(id),
    listProductCategories(),
    getProductRuntimeMode()
  ]);

  if (product === null) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin / Produtos</p>
        <h1>Editar produto</h1>
        <p>Edicao preparada para repository Drizzle e fallback controlado sem Neon.</p>
      </section>
      {runtimeMode.databaseNotice ? (
        <p className="form-message form-message--error">{runtimeMode.databaseNotice}</p>
      ) : null}
      {runtimeMode.adminAuthNotice ? (
        <p className="form-message form-message--success">{runtimeMode.adminAuthNotice}</p>
      ) : null}
      <ProductForm
        product={product}
        categories={categories}
        action={updateProductAction.bind(null, id)}
        submitLabel="Salvar produto"
      />
    </main>
  );
}
