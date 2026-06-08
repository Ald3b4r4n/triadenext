import type { ProductImage } from "../types";

type ProductImageManagerProps = {
  images: ProductImage[];
};

export function ProductImageManager({ images }: ProductImageManagerProps) {
  return (
    <section className="form-panel">
      <div className="form-panel__header">
        <h2>Imagens</h2>
        <p className="muted">
          Upload real exige Blob token. Nesta fase o fluxo valida tipo, tamanho e metadata.
        </p>
      </div>
      <label className="form-field">
        <span>Adicionar imagem</span>
        <input name="productImage" type="file" accept="image/jpeg,image/png,image/webp" disabled />
        <small>Upload completo sera ativado quando autenticacao, Blob e persistencia estiverem ligados.</small>
      </label>
      <div className="image-manager-list">
        {images.length === 0 ? <p className="muted">Nenhuma imagem vinculada.</p> : null}
        {images.map((image) => (
          <article key={image.id} className="image-manager-item">
            <span>{image.isCover ? "Capa" : "Galeria"}</span>
            <strong>{image.pathname}</strong>
            <small>{image.contentType ?? "tipo nao informado"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
