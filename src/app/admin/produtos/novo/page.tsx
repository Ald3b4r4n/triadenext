import { ProductForm } from "@/features/products/components/product-form";
import { createProductAction } from "@/features/products/server/product-actions";
import { listProductCategories } from "@/features/products/server/product-service";

export default async function NovoProdutoPage() {
  const categories = await listProductCategories();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin / Produtos</p>
        <h1>Novo produto</h1>
        <p>
          Criacao validada com Zod. Sem `DATABASE_URL`, o envio confirma validacao mas nao grava em
          banco real.
        </p>
      </section>
      <ProductForm categories={categories} action={createProductAction} submitLabel="Criar produto" />
    </main>
  );
}
