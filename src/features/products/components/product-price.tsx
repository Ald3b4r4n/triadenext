import { formatProductPrice } from "../utils";

type ProductPriceProps = {
  priceCents: number;
  compareAtPriceCents?: number | null;
};

export function ProductPrice({ priceCents, compareAtPriceCents }: ProductPriceProps) {
  return (
    <p className="product-price">
      <strong>{formatProductPrice(priceCents)}</strong>
      {compareAtPriceCents ? <span>{formatProductPrice(compareAtPriceCents)}</span> : null}
    </p>
  );
}
