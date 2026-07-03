import type { ProductImage } from "../types";

type ProductImageProps = {
  image: ProductImage | null;
  label: string;
};

export function ProductImage({ image, label }: ProductImageProps) {
  if (image === null) {
    return (
      <div className="product-image product-image--empty" role="img" aria-label={label}>
        <span className="product-image__bottle" />
        <span className="product-image__shine" />
      </div>
    );
  }

  if (image.blobUrl.startsWith("fixture://")) {
    return (
      <div className="product-image product-image--render" role="img" aria-label={image.altText ?? label}>
        <span className="product-image__bottle">
          <span>Tríade</span>
        </span>
        <span className="product-image__shine" />
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
