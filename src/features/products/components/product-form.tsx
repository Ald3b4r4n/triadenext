"use client";

import { useActionState } from "react";
import type { ProductActionState } from "../server/product-actions";
import type { Category, Product } from "../types";
import { PriceInput } from "./price-input";
import { ProductImageManager } from "./product-image-manager";
import { ProductStatusSelect } from "./product-status-select";

type ProductFormProps = {
  product?: Product | null;
  categories: Category[];
  action: (state: ProductActionState, formData: FormData) => Promise<ProductActionState>;
  submitLabel: string;
};

export function ProductForm({ product, categories, action, submitLabel }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    message: ""
  } satisfies ProductActionState);
  const selectedCategoryIds = new Set(product?.categories.map((category) => category.id) ?? []);

  return (
    <form className="product-form" action={formAction}>
      {state.message ? <p className={`form-message form-message--${state.status}`}>{state.message}</p> : null}
      <section className="form-panel">
        <div className="form-panel__header">
          <h2>Dados principais</h2>
          <p className="muted">Campos essenciais para catalogo, vitrine e paridade publica.</p>
        </div>
        <div className="form-grid">
          <label className="form-field">
            <span>Nome</span>
            <input name="name" defaultValue={product?.name ?? ""} required />
            {state.fields?.name ? <small>{state.fields.name}</small> : null}
          </label>
          <label className="form-field">
            <span>Slug</span>
            <input name="slug" defaultValue={product?.slug ?? ""} placeholder="gerado pelo nome" />
            {state.fields?.slug ? <small>{state.fields.slug}</small> : null}
          </label>
          <label className="form-field">
            <span>SKU</span>
            <input name="sku" defaultValue={product?.sku ?? ""} required />
            {state.fields?.sku ? <small>{state.fields.sku}</small> : null}
          </label>
          <ProductStatusSelect defaultValue={product?.status ?? "draft"} />
          <label className="form-field">
            <span>Genero</span>
            <select name="gender" defaultValue={product?.gender ?? "nao_informado"}>
              <option value="nao_informado">Nao informado</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="unissex">Unissex</option>
            </select>
          </label>
          <label className="form-field">
            <span>Volume ml</span>
            <input name="volumeMl" type="number" min="1" defaultValue={product?.volumeMl ?? ""} />
          </label>
        </div>
        <label className="form-field">
          <span>Descricao curta</span>
          <input name="shortDescription" defaultValue={product?.shortDescription ?? ""} />
        </label>
        <label className="form-field">
          <span>Descricao</span>
          <textarea name="description" defaultValue={product?.description ?? ""} rows={5} />
        </label>
      </section>

      <section className="form-panel">
        <div className="form-panel__header">
          <h2>Comercial</h2>
        </div>
        <div className="form-grid">
          <PriceInput
            name="price"
            label="Preco"
            defaultValueCents={product?.priceCents}
            required
          />
          <PriceInput
            name="compareAtPrice"
            label="Preco comparativo"
            defaultValueCents={product?.compareAtPriceCents}
          />
          <PriceInput
            name="costPrice"
            label="Custo"
            defaultValueCents={product?.costPriceCents}
          />
          <label className="form-field">
            <span>Estoque</span>
            <input
              name="stockQuantity"
              type="number"
              min="0"
              defaultValue={product?.stockQuantity ?? 0}
              required
            />
          </label>
          <label className="form-field">
            <span>Alerta estoque baixo</span>
            <input
              name="lowStockThreshold"
              type="number"
              min="0"
              defaultValue={product?.lowStockThreshold ?? 0}
            />
          </label>
          <label className="form-field">
            <span>Publicado em</span>
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(product?.publishedAt)}
            />
          </label>
        </div>
        {state.fields?.status ? <p className="field-error">{state.fields.status}</p> : null}
        <label className="checkbox-field">
          <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured ?? false} />
          <span>Destaque na vitrine</span>
        </label>
      </section>

      <section className="form-panel">
        <div className="form-panel__header">
          <h2>Categorias e SEO</h2>
        </div>
        <div className="category-picker">
          {categories.map((category) => (
            <label key={category.id} className="checkbox-field">
              <input
                name="categoryIds"
                type="checkbox"
                value={category.id}
                defaultChecked={selectedCategoryIds.has(category.id)}
                disabled={!category.isActive}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
        <div className="form-grid">
          <label className="form-field">
            <span>Marca</span>
            <input name="brand" defaultValue={product?.brand ?? ""} />
          </label>
          <label className="form-field">
            <span>Inspiracao</span>
            <input name="inspirationName" defaultValue={product?.inspirationName ?? ""} />
          </label>
          <label className="form-field">
            <span>Concentracao</span>
            <input name="concentration" defaultValue={product?.concentration ?? ""} />
          </label>
          <label className="form-field">
            <span>Titulo SEO</span>
            <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
          </label>
        </div>
        <label className="form-field">
          <span>Descricao SEO</span>
          <textarea name="seoDescription" defaultValue={product?.seoDescription ?? ""} rows={3} />
        </label>
      </section>

      <ProductImageManager images={product?.images ?? []} />

      <div className="form-actions">
        <button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function formatDateTimeLocal(value?: Date | null) {
  if (!value) {
    return "";
  }

  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
