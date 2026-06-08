import { filterPublicProducts, normalizeProductSlug, toPublicProduct } from "../domain";
import { createProductRepository } from "./product-repository";

const repository = createProductRepository();

export async function listPublicProducts(now = new Date()) {
  const products = await repository.listProducts();
  return filterPublicProducts(products, now);
}

export async function getPublicProductBySlug(slug: string, now = new Date()) {
  const product = await repository.findProductBySlug(normalizeProductSlug(slug));

  if (product === null) {
    return null;
  }

  return toPublicProduct(product, now);
}

export async function listAdminProducts() {
  return repository.listProducts();
}
