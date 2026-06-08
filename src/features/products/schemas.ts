import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "published", "inactive"]);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const productImageSchema = z.object({
  id: z.string(),
  productId: z.string(),
  blobUrl: z.string().url(),
  pathname: z.string().min(1),
  altText: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isCover: z.boolean().default(false),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  sizeBytes: z.number().int().positive().nullable().optional(),
  contentType: z.string().nullable().optional(),
  createdAt: z.date()
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  inspirationName: z.string().nullable().optional(),
  gender: z.enum(["feminino", "masculino", "unissex", "nao_informado"]).nullable().optional(),
  concentration: z.string().nullable().optional(),
  volumeMl: z.number().int().positive().nullable().optional(),
  sku: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  compareAtPriceCents: z.number().int().nonnegative().nullable().optional(),
  costPriceCents: z.number().int().nonnegative().nullable().optional(),
  stockQuantity: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  status: productStatusSchema,
  isFeatured: z.boolean(),
  publishedAt: z.date().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  categories: z.array(categorySchema),
  images: z.array(productImageSchema),
  createdAt: z.date(),
  updatedAt: z.date()
});
