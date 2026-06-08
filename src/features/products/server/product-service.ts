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

export async function listProductCategories() {
  return repository.listCategories();
}

export async function getAdminProductById(id: string) {
  return repository.findProductById(id);
}

export async function createAdminProduct(input: Parameters<typeof repository.createProduct>[0]) {
  return repository.createProduct(input);
}

export async function updateAdminProduct(
  id: string,
  input: Parameters<typeof repository.updateProduct>[1]
) {
  return repository.updateProduct(id, input);
}
