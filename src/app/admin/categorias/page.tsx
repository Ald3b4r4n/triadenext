import { listProductCategories } from "@/features/products/server/product-service";
import { createCategoryAction } from "@/features/products/server/category-actions";

export default async function AdminCategoriasPage() {
  const categories = await listProductCategories();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin</p>
        <h1>Categorias</h1>
        <p>Organize a vitrine e disponibilize novas categorias para o cadastro de produtos.</p>
      </section>
      <section className="admin-category-create" aria-labelledby="new-category-title">
        <div>
          <p className="muted">Nova categoria</p>
          <h2 id="new-category-title">Cadastrar categoria</h2>
          <p>O slug identifica a categoria nas URLs e integrações.</p>
        </div>
        <form action={createCategoryAction}>
          <label><span>Nome</span><input name="name" required minLength={2} placeholder="Ex.: Perfumes árabes" /></label>
          <label><span>Slug</span><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="perfumes-arabes" /></label>
          <label className="admin-category-create__description"><span>Descrição</span><input name="description" maxLength={240} placeholder="Descrição curta para organização do catálogo" /></label>
          <label><span>Ordem</span><input name="sortOrder" type="number" min={0} max={999} defaultValue={0} /></label>
          <label className="admin-category-create__toggle"><input name="isActive" type="checkbox" defaultChecked /> <span>Ativa</span></label>
          <button className="primary-action" type="submit">Criar categoria</button>
        </form>
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
