import { StorefrontHome } from "@/components/storefront/storefront-home";
import { listPublicProducts } from "@/features/products/server/product-service";
import type { PublicProduct } from "@/features/products/types";

export default async function HomePage() {
  let catalogUnavailable = false;
  let products: PublicProduct[] = [];

  try {
    products = await listPublicProducts();
  } catch {
    catalogUnavailable = true;
  }

  const featuredProducts = [...products]
    .sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured))
    .slice(0, 6);

  return (
    <StorefrontHome products={featuredProducts} catalogUnavailable={catalogUnavailable} />
  );
}
