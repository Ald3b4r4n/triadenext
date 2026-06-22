import { listProductCategories } from "@/features/products/server/product-service";

export default async function AdminCategoriasPage() {
  const categories = await listProductCategories();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin</p>
        <h1>Categorias</h1>
        <p>Estrutura inicial para seleção de categorias em produtos. CRUD completo fica pendente.</p>
      </section>
      <div className="admin-table" role="table" aria-label="Categorias administrativas">
        <div className="admin-table__row admin-table__row--categories" role="row">
          <span role="columnheader">Categoria</span>
          <span role="columnheader">Slug</span>
          <span role="columnheader">Status</span>
        </div>
        {categories.map((category) => (
          <div className="admin-table__row admin-table__row--categories" role="row" key={category.id}>
            <span role="cell">
              <strong>{category.name}</strong>
              <small>{category.description}</small>
            </span>
            <span role="cell">{category.slug}</span>
            <span role="cell">{category.isActive ? "Ativa" : "Inativa"}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
