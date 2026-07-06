import { z } from "zod";
import {
  normalizeProductSlug,
  parsePriceToCents,
  productCanBeMarkedPublic
} from "./domain";

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
  gender: z
    .enum(["feminino", "masculino", "unissex", "nao_informado"])
    .nullable()
    .optional(),
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

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .optional();

const nullableIntegerFromFormSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? Number(value) : null))
  .pipe(z.number().int().positive().nullable());

const nonnegativeIntegerFromFormSchema = z
  .string()
  .trim()
  .transform((value) => Number(value))
  .pipe(z.number().int().nonnegative());

const priceFromFormSchema = z
  .string()
  .trim()
  .transform((value) => parsePriceToCents(value))
  .pipe(z.number().int().nonnegative().nullable());

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome do produto."),
    slug: z
      .string()
      .trim()
      .optional()
      .transform((value) => normalizeProductSlug(value ?? "")),
    shortDescription: optionalTextSchema,
    description: optionalTextSchema,
    brand: optionalTextSchema,
    inspirationName: optionalTextSchema,
    gender: z
      .enum(["feminino", "masculino", "unissex", "nao_informado"])
      .nullable()
      .optional(),
    concentration: optionalTextSchema,
    volumeMl: nullableIntegerFromFormSchema,
    sku: z.string().trim().min(1, "Informe o SKU."),
    price: priceFromFormSchema.refine((value) => value !== null && value > 0, {
      message: "Informe um preço maior que zero."
    }),
    compareAtPrice: priceFromFormSchema,
    costPrice: priceFromFormSchema,
    stockQuantity: nonnegativeIntegerFromFormSchema,
    lowStockThreshold: nonnegativeIntegerFromFormSchema,
    status: productStatusSchema,
    isFeatured: z
      .union([z.literal("on"), z.literal("true"), z.literal("false")])
      .optional()
      .transform((value) => value === "on" || value === "true"),
    publishedAt: z
      .string()
      .trim()
      .transform((value) => (value.length > 0 ? new Date(value) : null))
      .pipe(z.date().nullable()),
    seoTitle: optionalTextSchema,
    seoDescription: optionalTextSchema,
    categoryIds: z.array(z.string()).default([])
  })
  .transform((value) => ({
    name: value.name,
    slug: value.slug.length > 0 ? value.slug : normalizeProductSlug(value.name),
    shortDescription: value.shortDescription,
    description: value.description,
    brand: value.brand,
    inspirationName: value.inspirationName,
    gender: value.gender ?? "nao_informado",
    concentration: value.concentration,
    volumeMl: value.volumeMl,
    sku: value.sku,
    priceCents: value.price ?? 0,
    compareAtPriceCents: value.compareAtPrice,
    costPriceCents: value.costPrice,
    stockQuantity: value.stockQuantity,
    lowStockThreshold: value.lowStockThreshold,
    status: value.status,
    isFeatured: value.isFeatured,
    publishedAt: value.publishedAt,
    seoTitle: value.seoTitle,
    seoDescription: value.seoDescription,
    categoryIds: value.categoryIds
  }))
  .superRefine((value, context) => {
    if (!productCanBeMarkedPublic(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Produto publicado exige nome, slug, SKU, preço, estoque positivo e data de publicação válida.",
        path: ["status"]
      });
    }
  });

export function productFormDataToObject(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    shortDescription: formData.get("shortDescription")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    brand: formData.get("brand")?.toString() ?? "",
    inspirationName: formData.get("inspirationName")?.toString() ?? "",
    gender: formData.get("gender")?.toString() || "nao_informado",
    concentration: formData.get("concentration")?.toString() ?? "",
    volumeMl: formData.get("volumeMl")?.toString() ?? "",
    sku: formData.get("sku")?.toString() ?? "",
    price: formData.get("price")?.toString() ?? "",
    compareAtPrice: formData.get("compareAtPrice")?.toString() ?? "",
    costPrice: formData.get("costPrice")?.toString() ?? "",
    stockQuantity: formData.get("stockQuantity")?.toString() ?? "0",
    lowStockThreshold: formData.get("lowStockThreshold")?.toString() ?? "0",
    status: formData.get("status")?.toString() ?? "draft",
    isFeatured: formData.get("isFeatured")?.toString() ?? "false",
    publishedAt: formData.get("publishedAt")?.toString() ?? "",
    seoTitle: formData.get("seoTitle")?.toString() ?? "",
    seoDescription: formData.get("seoDescription")?.toString() ?? "",
    categoryIds: formData.getAll("categoryIds").map((value) => value.toString())
  };
}
