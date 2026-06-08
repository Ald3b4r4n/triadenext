import { db } from "@/db/client";
import { productCategories, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { devCategories, devProducts } from "../dev/fixtures";
import type { Category, Product, ProductMutationInput } from "../types";

export type ProductRepository = {
  listProducts(): Promise<Product[]>;
  listCategories(): Promise<Category[]>;
  findProductById(id: string): Promise<Product | null>;
  findProductBySlug(slug: string): Promise<Product | null>;
  createProduct(input: ProductMutationInput): Promise<ProductMutationPersistenceResult>;
  updateProduct(id: string, input: ProductMutationInput): Promise<ProductMutationPersistenceResult>;
};

export type ProductMutationPersistenceResult =
  | {
      status: "persisted";
      productId: string;
      message: string;
    }
  | {
      status: "dev_fallback";
      productId: string;
      message: string;
    };

export function createProductRepository(): ProductRepository {
  if (db === null) {
    return createFixtureProductRepository();
  }

  return createDrizzleProductRepository();
}

function createFixtureProductRepository(): ProductRepository {
  return {
    async listProducts() {
      return devProducts;
    },
    async listCategories() {
      return devCategories;
    },
    async findProductById(id: string) {
      return devProducts.find((product) => product.id === id) ?? null;
    },
    async findProductBySlug(slug: string) {
      return devProducts.find((product) => product.slug === slug) ?? null;
    },
    async createProduct(input: ProductMutationInput) {
      return {
        status: "dev_fallback",
        productId: `dev-${input.slug}`,
        message:
          "Produto validado, mas nao persistido: DATABASE_URL ausente. Persistencia real depende de Neon/Drizzle."
      };
    },
    async updateProduct(id: string) {
      return {
        status: "dev_fallback",
        productId: id,
        message:
          "Produto validado, mas nao atualizado em banco: DATABASE_URL ausente. Persistencia real depende de Neon/Drizzle."
      };
    }
  };
}

function createDrizzleProductRepository(): ProductRepository {
  if (db === null) {
    return createFixtureProductRepository();
  }

  const database = db;

  return {
    async listProducts() {
      return devProducts;
    },
    async listCategories() {
      return devCategories;
    },
    async findProductById(id: string) {
      return devProducts.find((product) => product.id === id) ?? null;
    },
    async findProductBySlug(slug: string) {
      return devProducts.find((product) => product.slug === slug) ?? null;
    },
    async createProduct(input: ProductMutationInput) {
      const [createdProduct] = await database
        .insert(products)
        .values(toProductRow(input))
        .returning({ id: products.id });

      if (input.categoryIds.length > 0) {
        await database.insert(productCategories).values(
          input.categoryIds.map((categoryId) => ({
            productId: createdProduct.id,
            categoryId
          }))
        );
      }

      return {
        status: "persisted",
        productId: createdProduct.id,
        message: "Produto criado em Neon/Drizzle."
      };
    },
    async updateProduct(id: string, input: ProductMutationInput) {
      await database.update(products).set(toProductRow(input)).where(eq(products.id, id));
      await database.delete(productCategories).where(eq(productCategories.productId, id));

      if (input.categoryIds.length > 0) {
        await database.insert(productCategories).values(
          input.categoryIds.map((categoryId) => ({
            productId: id,
            categoryId
          }))
        );
      }

      return {
        status: "persisted",
        productId: id,
        message: "Produto atualizado em Neon/Drizzle."
      };
    }
  };
}

function toProductRow(input: ProductMutationInput) {
  return {
    categoryId: input.categoryIds[0] ?? null,
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    shortDescription: input.shortDescription,
    description: input.description,
    brand: input.brand,
    inspirationName: input.inspirationName,
    gender: input.gender,
    concentration: input.concentration,
    volumeMl: input.volumeMl,
    price: (input.priceCents / 100).toFixed(2),
    compareAtPrice:
      input.compareAtPriceCents !== null && input.compareAtPriceCents !== undefined
        ? (input.compareAtPriceCents / 100).toFixed(2)
        : null,
    priceCents: input.priceCents,
    compareAtPriceCents: input.compareAtPriceCents,
    costPriceCents: input.costPriceCents,
    status: input.status,
    stockQuantity: input.stockQuantity,
    lowStockThreshold: input.lowStockThreshold,
    isFeatured: input.isFeatured,
    publishedAt: input.publishedAt,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    updatedAt: new Date()
  };
}
