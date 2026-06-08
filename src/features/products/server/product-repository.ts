import { db } from "@/db/client";
import { devProducts } from "../dev/fixtures";
import type { Product } from "../types";

export type ProductRepository = {
  listProducts(): Promise<Product[]>;
  findProductBySlug(slug: string): Promise<Product | null>;
};

export function createProductRepository(): ProductRepository {
  if (db === null) {
    return createFixtureProductRepository();
  }

  return createFixtureProductRepository();
}

function createFixtureProductRepository(): ProductRepository {
  return {
    async listProducts() {
      return devProducts;
    },
    async findProductBySlug(slug: string) {
      return devProducts.find((product) => product.slug === slug) ?? null;
    }
  };
}
