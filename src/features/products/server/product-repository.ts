import { db } from "@/db/client";
import { categories, productCategories, productImages, products } from "@/db/schema";
import { assertCanMutateRealData, runtimeMessages } from "@/lib/runtime-mode";
import { asc, eq, inArray } from "drizzle-orm";
import { sortProductImages } from "../domain";
import { devCategories, devProducts } from "../dev/fixtures";
import type { Category, Product, ProductGender, ProductImage, ProductMutationInput } from "../types";

export type ProductRepository = {
  listProducts(): Promise<Product[]>;
  listCategories(): Promise<Category[]>;
  findProductById(id: string): Promise<Product | null>;
  findProductBySlug(slug: string): Promise<Product | null>;
  listProductImages(productId: string): Promise<ProductImage[]>;
  saveProductImageMetadata(input: ProductImageMetadataInput): Promise<ProductImageMetadataResult>;
  createProduct(input: ProductMutationInput): Promise<ProductMutationPersistenceResult>;
  updateProduct(id: string, input: ProductMutationInput): Promise<ProductMutationPersistenceResult>;
};

export type ProductImageMetadataInput = {
  productId: string;
  blobUrl: string;
  pathname: string;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  contentType?: string | null;
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
    }
  | {
      status: "blocked";
      productId: string | null;
      message: string;
    };

export type ProductImageMetadataResult =
  | {
      status: "persisted";
      imageId: string;
      message: string;
    }
  | {
      status: "blocked";
      imageId: null;
      message: string;
    }
  | {
      status: "dev_fallback";
      imageId: null;
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
    async listProductImages(productId: string) {
      return sortProductImages(
        devProducts.find((product) => product.id === productId)?.images ?? []
      );
    },
    async saveProductImageMetadata() {
      return {
        status: "dev_fallback",
        imageId: null,
        message:
          "Metadata de imagem validada, mas nao persistida: DATABASE_URL ausente. Persistencia real depende de Neon/Drizzle."
      };
    },
    async createProduct(input: ProductMutationInput) {
      return {
        status: "dev_fallback",
        productId: `dev-${input.slug}`,
        message: runtimeMessages.devFallbackCreate
      };
    },
    async updateProduct(id: string) {
      return {
        status: "dev_fallback",
        productId: id,
        message: runtimeMessages.devFallbackUpdate
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
      const productRows = await database.select().from(products).orderBy(asc(products.name));
      return hydrateProducts(productRows);
    },
    async listCategories() {
      const rows = await database.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
      return rows.map(toCategory);
    },
    async findProductById(id: string) {
      const [productRow] = await database.select().from(products).where(eq(products.id, id)).limit(1);
      return productRow ? (await hydrateProducts([productRow]))[0] ?? null : null;
    },
    async findProductBySlug(slug: string) {
      const [productRow] = await database
        .select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);
      return productRow ? (await hydrateProducts([productRow]))[0] ?? null : null;
    },
    async listProductImages(productId: string) {
      const rows = await database
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));
      return rows.map(toProductImage);
    },
    async saveProductImageMetadata(input: ProductImageMetadataInput) {
      const guardrail = assertCanMutateRealData();

      if (!guardrail.allowed) {
        return {
          status: "blocked",
          imageId: null,
          message: guardrail.message
        };
      }

      const [createdImage] = await database.transaction(async (tx) => {
        if (input.isCover) {
          await tx
            .update(productImages)
            .set({ isCover: false })
            .where(eq(productImages.productId, input.productId));
        }

        return tx
          .insert(productImages)
          .values({
            productId: input.productId,
            blobUrl: input.blobUrl,
            pathname: input.pathname,
            altText: input.altText,
            sortOrder: input.sortOrder,
            isCover: input.isCover,
            width: input.width,
            height: input.height,
            sizeBytes: input.sizeBytes,
            contentType: input.contentType
          })
          .returning({ id: productImages.id });
      });

      return {
        status: "persisted",
        imageId: createdImage.id,
        message: runtimeMessages.imageMetadataPersisted
      };
    },
    async createProduct(input: ProductMutationInput) {
      const guardrail = assertCanMutateRealData();

      if (!guardrail.allowed) {
        return {
          status: "blocked",
          productId: null,
          message: guardrail.message
        };
      }

      const [createdProduct] = await database.transaction(async (tx) => {
        const [insertedProduct] = await tx
          .insert(products)
          .values(toProductRow(input))
          .returning({ id: products.id });

        if (input.categoryIds.length > 0) {
          await tx.insert(productCategories).values(
            input.categoryIds.map((categoryId) => ({
              productId: insertedProduct.id,
              categoryId
            }))
          );
        }

        return [insertedProduct];
      });

      return {
        status: "persisted",
        productId: createdProduct.id,
        message: runtimeMessages.persistedCreate
      };
    },
    async updateProduct(id: string, input: ProductMutationInput) {
      const guardrail = assertCanMutateRealData();

      if (!guardrail.allowed) {
        return {
          status: "blocked",
          productId: id,
          message: guardrail.message
        };
      }

      await database.transaction(async (tx) => {
        await tx.update(products).set(toProductRow(input)).where(eq(products.id, id));
        await tx.delete(productCategories).where(eq(productCategories.productId, id));

        if (input.categoryIds.length > 0) {
          await tx.insert(productCategories).values(
            input.categoryIds.map((categoryId) => ({
              productId: id,
              categoryId
            }))
          );
        }
      });

      return {
        status: "persisted",
        productId: id,
        message: runtimeMessages.persistedUpdate
      };
    }
  };
}

async function hydrateProducts(productRows: Array<typeof products.$inferSelect>) {
  if (productRows.length === 0 || db === null) {
    return [];
  }

  const productIds = productRows.map((product) => product.id);

  const [categoryRows, imageRows] = await Promise.all([
    db
      .select({
        productId: productCategories.productId,
        category: categories
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(inArray(productCategories.productId, productIds))
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt))
  ]);

  const categoriesByProductId = new Map<string, Category[]>();
  const imagesByProductId = new Map<string, ProductImage[]>();

  for (const row of categoryRows) {
    const current = categoriesByProductId.get(row.productId) ?? [];
    current.push(toCategory(row.category));
    categoriesByProductId.set(row.productId, current);
  }

  for (const row of imageRows) {
    const current = imagesByProductId.get(row.productId) ?? [];
    current.push(toProductImage(row));
    imagesByProductId.set(row.productId, current);
  }

  return productRows.map((product) =>
    toProduct(
      product,
      categoriesByProductId.get(product.id) ?? [],
      imagesByProductId.get(product.id) ?? []
    )
  );
}

function toCategory(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parentId,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function toProductImage(row: typeof productImages.$inferSelect): ProductImage {
  return {
    id: row.id,
    productId: row.productId,
    blobUrl: row.blobUrl,
    pathname: row.pathname,
    altText: row.altText,
    sortOrder: row.sortOrder,
    isCover: row.isCover,
    width: row.width,
    height: row.height,
    sizeBytes: row.sizeBytes,
    contentType: row.contentType,
    createdAt: row.createdAt
  };
}

function toProduct(
  row: typeof products.$inferSelect,
  productCategoryRows: Category[],
  imageRows: ProductImage[]
): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    description: row.description,
    brand: row.brand,
    inspirationName: row.inspirationName,
    gender: normalizeGender(row.gender),
    concentration: row.concentration,
    volumeMl: row.volumeMl,
    sku: row.sku,
    priceCents: row.priceCents,
    compareAtPriceCents: row.compareAtPriceCents,
    costPriceCents: row.costPriceCents,
    stockQuantity: row.stockQuantity,
    lowStockThreshold: row.lowStockThreshold,
    status: row.status,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    categories: productCategoryRows,
    images: sortProductImages(imageRows),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function normalizeGender(value: string | null): ProductGender | null {
  if (
    value === "feminino" ||
    value === "masculino" ||
    value === "unissex" ||
    value === "nao_informado"
  ) {
    return value;
  }

  return value === null ? null : "nao_informado";
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
