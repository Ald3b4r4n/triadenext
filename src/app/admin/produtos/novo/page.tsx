import { ProductForm } from "@/features/products/components/product-form";
import { createProductAction } from "@/features/products/server/product-actions";
import {
  getProductRuntimeMode,
  listProductCategories
} from "@/features/products/server/product-service";

export default async function NovoProdutoPage() {
  const [categories, runtimeMode] = await Promise.all([
    listProductCategories(),
    getProductRuntimeMode()
  ]);

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin / Produtos</p>
        <h1>Novo produto</h1>
        <p>
          Criação validada antes da gravação. Em ambiente local seguro, o envio confirma a
          validação sem persistir dados definitivos.
        </p>
      </section>
      {runtimeMode.databaseNotice ? (
        <p className="form-message form-message--error">{runtimeMode.databaseNotice}</p>
      ) : null}
      {runtimeMode.adminAuthNotice ? (
        <p className="form-message form-message--success">{runtimeMode.adminAuthNotice}</p>
      ) : null}
      <ProductForm categories={categories} action={createProductAction} submitLabel="Criar produto" />
    </main>
  );
}
