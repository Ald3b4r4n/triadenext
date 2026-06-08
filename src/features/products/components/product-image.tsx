import type { ProductImage } from "../types";

type ProductImageProps = {
  image: ProductImage | null;
  label: string;
};

export function ProductImage({ image, label }: ProductImageProps) {
  if (image === null) {
    return (
      <div className="product-image product-image--empty" role="img" aria-label={label}>
        <span>Sem imagem</span>
      </div>
    );
  }

  return (
    <div
      className="product-image"
      role="img"
      aria-label={image.altText ?? label}
      style={{ backgroundImage: `url(${image.blobUrl})` }}
    />
  );
}
