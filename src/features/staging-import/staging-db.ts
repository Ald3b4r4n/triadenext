import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import {
  categories,
  coupons,
  productCategories,
  productImages,
  products,
  shippingRules
} from "@/db/schema";
import { detectProductionSignals } from "./production-guard";
import type {
  EntityUpsertResult,
  ImportEntityName,
  ResetExecutionResult,
  StagingEnv,
  StagingImportPlan,
  StagingImportStore,
  StagingPreflightResult
} from "./types";
import type {
  NormalizedCategory,
  NormalizedCoupon,
  NormalizedInventoryItem,
  NormalizedProduct,
  NormalizedProductImage,
  NormalizedShippingRule
} from "@/features/data-dry-run/types";

function createDrizzleClient(connectionString: string) {
  return drizzle(neon(connectionString), { schema });
}

type StagingDrizzleClient = ReturnType<typeof createDrizzleClient>;
type CategoryRow = typeof categories.$inferSelect;
type ProductRow = typeof products.$inferSelect;
type ShippingRuleRow = typeof shippingRules.$inferSelect;

export function connectApprovedStagingDatabase(input: {
  preflight: StagingPreflightResult;
  env?: StagingEnv;
  variableName?: "STAGING_DATABASE_URL";
}): StagingImportStore {
  if (input.preflight.status !== "planned") {
    throw new Error(
      "Preflight precisa estar planned antes de abrir conexão staging."
    );
  }

  const env = input.env ?? process.env;
  const variableName = input.variableName ?? "STAGING_DATABASE_URL";
  const connectionString = env[variableName]?.trim();

  if (!connectionString) {
    throw new Error(
      "Conexão staging ausente. Valor não impresso por segurança."
    );
  }

  const guard = detectProductionSignals({
    target: input.preflight.environment?.target,
    labels: {
      "connection-string": connectionString,
      "connection-variable": variableName
    },
    env
  });

  if (!guard.allowed) {
    throw new Error(
      "Conexão staging bloqueada por sinal de produção ou secret."
    );
  }

  return createDrizzleStagingImportStore(createDrizzleClient(connectionString));
}

export function createDrizzleStagingImportStore(
  database: StagingDrizzleClient
): StagingImportStore {
  return {
    async countEntities() {
      const [categoryRows, productRows, imageRows, couponRows, shippingRows] =
        await Promise.all([
          database.select().from(categories),
          database.select().from(products),
          database.select().from(productImages),
          database.select().from(coupons),
          database.select().from(shippingRules)
        ]);
      return {
        categories: categoryRows.length,
        products: productRows.length,
        productImages: imageRows.length,
        inventory: productRows.length,
        coupons: couponRows.length,
        shippingRules: shippingRows.length
      };
    },
    async runInTransaction(callback) {
      return database.transaction(async (tx) =>
        callback(
          createDrizzleStagingImportStore(tx as unknown as StagingDrizzleClient)
        )
      );
    },
    async upsertCategory(category) {
      return upsertCategory(database, category);
    },
    async upsertProduct(product) {
      return upsertProduct(database, product);
    },
    async ensureProductCategory(productSku, categorySlug) {
      return ensureProductCategory(database, productSku, categorySlug);
    },
    async upsertProductImage(image) {
      return upsertProductImage(database, image);
    },
    async upsertInventory(item) {
      return upsertInventory(database, item);
    },
    async upsertCoupon(coupon) {
      return upsertCoupon(database, coupon);
    },
    async upsertShippingRule(rule) {
      return upsertShippingRule(database, rule);
    },
    async resetApprovedScope(plan) {
      return resetApprovedScope(database, plan);
    }
  };
}

export function createMemoryStagingImportStore(): StagingImportStore {
  const state = {
    categories: new Map<string, NormalizedCategory>(),
    products: new Map<string, NormalizedProduct>(),
    productImages: new Map<string, NormalizedProductImage>(),
    inventory: new Map<string, NormalizedInventoryItem>(),
    coupons: new Map<string, NormalizedCoupon>(),
    shippingRules: new Map<string, NormalizedShippingRule>()
  };

  return {
    async countEntities() {
      return {
        categories: state.categories.size,
        products: state.products.size,
        productImages: state.productImages.size,
        inventory: state.inventory.size,
        coupons: state.coupons.size,
        shippingRules: state.shippingRules.size
      };
    },
    async runInTransaction(callback) {
      return callback(this);
    },
    async upsertCategory(category) {
      const status = state.categories.has(category.slug)
        ? "updated"
        : "inserted";
      state.categories.set(category.slug, category);
      return result("categories", category.slug, status);
    },
    async upsertProduct(product) {
      const existingBySlug = [...state.products.values()].find(
        (candidate) =>
          candidate.slug === product.slug && candidate.sku !== product.sku
      );
      if (existingBySlug) {
        return result(
          "products",
          product.sku,
          "conflict",
          "Slug ja associado a outro SKU."
        );
      }
      const status = state.products.has(product.sku) ? "updated" : "inserted";
      state.products.set(product.sku, product);
      return result("products", product.sku, status);
    },
    async ensureProductCategory(productSku, categorySlug) {
      if (
        !state.products.has(productSku) ||
        !state.categories.has(categorySlug)
      ) {
        return result(
          "products",
          `${productSku}:${categorySlug}`,
          "conflict",
          "Produto ou categoria ausente."
        );
      }
      return result(
        "products",
        `${productSku}:${categorySlug}`,
        "skipped",
        "Relacionamento validado."
      );
    },
    async upsertProductImage(image) {
      if (!state.products.has(image.productSku)) {
        return result(
          "productImages",
          image.productSku,
          "conflict",
          "Imagem referencia produto ausente."
        );
      }
      const key = `${image.productSku}:${image.reference}`;
      const status = state.productImages.has(key) ? "updated" : "inserted";
      state.productImages.set(key, image);
      return result("productImages", key, status);
    },
    async upsertInventory(item) {
      if (!state.products.has(item.productSku)) {
        return result(
          "inventory",
          item.productSku,
          "conflict",
          "Inventario referencia produto ausente."
        );
      }
      const status = state.inventory.has(item.productSku)
        ? "updated"
        : "inserted";
      state.inventory.set(item.productSku, item);
      return result("inventory", item.productSku, status);
    },
    async upsertCoupon(coupon) {
      const status = state.coupons.has(coupon.code) ? "updated" : "inserted";
      state.coupons.set(coupon.code, coupon);
      return result("coupons", coupon.code, status);
    },
    async upsertShippingRule(rule) {
      const status = state.shippingRules.has(rule.ruleCode)
        ? "updated"
        : "inserted";
      state.shippingRules.set(rule.ruleCode, rule);
      return result("shippingRules", rule.ruleCode, status);
    },
    async resetApprovedScope(plan) {
      for (const item of plan.entities.productImages)
        state.productImages.delete(`${item.productSku}:${item.reference}`);
      for (const item of plan.entities.inventory)
        state.inventory.delete(item.productSku);
      for (const item of plan.entities.products)
        state.products.delete(item.sku);
      for (const item of plan.entities.categories)
        state.categories.delete(item.slug);
      for (const item of plan.entities.coupons) state.coupons.delete(item.code);
      for (const item of plan.entities.shippingRules)
        state.shippingRules.delete(item.ruleCode);
      return {
        status: "executed",
        summary: summarizeCounts("skipped", await this.countEntities()),
        message: "Reset em memoria executado para escopo aprovado."
      };
    }
  };
}

async function upsertCategory(
  database: StagingDrizzleClient,
  category: NormalizedCategory
): Promise<EntityUpsertResult> {
  const [existing] = await database
    .select()
    .from(categories)
    .where(eq(categories.slug, category.slug))
    .limit(1);
  const parent = category.parentSlug
    ? await findCategoryBySlug(database, category.parentSlug)
    : null;

  if (category.parentSlug && !parent) {
    return result(
      "categories",
      category.slug,
      "conflict",
      "Categoria pai ausente."
    );
  }

  const row = {
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: parent?.id ?? null,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    updatedAt: new Date()
  };

  if (existing) {
    await database
      .update(categories)
      .set(row)
      .where(eq(categories.id, existing.id));
    return result("categories", category.slug, "updated");
  }

  await database.insert(categories).values(row);
  return result("categories", category.slug, "inserted");
}

async function upsertProduct(
  database: StagingDrizzleClient,
  product: NormalizedProduct
): Promise<EntityUpsertResult> {
  const [existingBySku] = await database
    .select()
    .from(products)
    .where(eq(products.sku, product.sku))
    .limit(1);
  const [existingBySlug] = await database
    .select()
    .from(products)
    .where(eq(products.slug, product.slug))
    .limit(1);
  const category = await findCategoryBySlug(database, product.categorySlug);

  if (!category) {
    return result(
      "products",
      product.sku,
      "conflict",
      "Categoria do produto ausente."
    );
  }

  if (existingBySlug && existingBySlug.sku !== product.sku) {
    return result(
      "products",
      product.sku,
      "conflict",
      "Slug ja associado a outro SKU."
    );
  }

  const row = {
    categoryId: category.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    brand: product.brand,
    price: centsToDecimal(product.priceCents),
    priceCents: product.priceCents,
    status: product.status,
    stockQuantity: product.stockQuantity,
    publishedAt: product.publishedAt ? new Date(product.publishedAt) : null,
    updatedAt: new Date()
  };

  if (existingBySku) {
    await database
      .update(products)
      .set(row)
      .where(eq(products.id, existingBySku.id));
    return result("products", product.sku, "updated");
  }

  await database.insert(products).values(row);
  return result("products", product.sku, "inserted");
}

async function ensureProductCategory(
  database: StagingDrizzleClient,
  productSku: string,
  categorySlug: string
): Promise<EntityUpsertResult> {
  const product = await findProductBySku(database, productSku);
  const category = await findCategoryBySlug(database, categorySlug);

  if (!product || !category) {
    return result(
      "products",
      `${productSku}:${categorySlug}`,
      "conflict",
      "Produto ou categoria ausente."
    );
  }

  const [existing] = await database
    .select()
    .from(productCategories)
    .where(
      and(
        eq(productCategories.productId, product.id),
        eq(productCategories.categoryId, category.id)
      )
    )
    .limit(1);

  if (existing) {
    return result(
      "products",
      `${productSku}:${categorySlug}`,
      "skipped",
      "Relacionamento já existia."
    );
  }

  await database
    .insert(productCategories)
    .values({ productId: product.id, categoryId: category.id });
  return result(
    "products",
    `${productSku}:${categorySlug}`,
    "inserted",
    "Relacionamento criado."
  );
}

async function upsertProductImage(
  database: StagingDrizzleClient,
  image: NormalizedProductImage
): Promise<EntityUpsertResult> {
  const product = await findProductBySku(database, image.productSku);

  if (!product) {
    return result(
      "productImages",
      image.productSku,
      "conflict",
      "Produto da imagem ausente."
    );
  }

  if (image.isCover) {
    await database
      .update(productImages)
      .set({ isCover: false })
      .where(eq(productImages.productId, product.id));
  }

  const [existing] = await database
    .select()
    .from(productImages)
    .where(
      and(
        eq(productImages.productId, product.id),
        eq(productImages.pathname, image.reference)
      )
    )
    .limit(1);
  const row = {
    productId: product.id,
    blobUrl: image.reference,
    pathname: image.reference,
    altText: image.altText,
    sortOrder: image.sortOrder,
    isCover: image.isCover
  };

  if (existing) {
    await database
      .update(productImages)
      .set(row)
      .where(eq(productImages.id, existing.id));
    return result(
      "productImages",
      `${image.productSku}:${image.reference}`,
      "updated"
    );
  }

  await database.insert(productImages).values(row);
  return result(
    "productImages",
    `${image.productSku}:${image.reference}`,
    "inserted"
  );
}

async function upsertInventory(
  database: StagingDrizzleClient,
  item: NormalizedInventoryItem
): Promise<EntityUpsertResult> {
  const product = await findProductBySku(database, item.productSku);

  if (!product) {
    return result(
      "inventory",
      item.productSku,
      "conflict",
      "Produto do inventario ausente."
    );
  }

  await database
    .update(products)
    .set({
      stockQuantity: item.isAvailable ? item.availableQuantity : 0,
      updatedAt: new Date()
    })
    .where(eq(products.id, product.id));
  return result("inventory", item.productSku, "updated");
}

async function upsertCoupon(
  database: StagingDrizzleClient,
  coupon: NormalizedCoupon
): Promise<EntityUpsertResult> {
  const [existing] = await database
    .select()
    .from(coupons)
    .where(eq(coupons.code, coupon.code))
    .limit(1);
  const row = {
    code: coupon.code,
    type: coupon.type,
    value: couponValueToDecimal(coupon),
    startsAt: coupon.startsAt ? new Date(coupon.startsAt) : null,
    endsAt: coupon.endsAt ? new Date(coupon.endsAt) : null,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    minimumSubtotalCents: coupon.minimumSubtotalCents,
    isActive: coupon.isActive,
    updatedAt: new Date()
  };

  if (existing) {
    await database.update(coupons).set(row).where(eq(coupons.id, existing.id));
    return result("coupons", coupon.code, "updated");
  }

  await database.insert(coupons).values(row);
  return result("coupons", coupon.code, "inserted");
}

async function upsertShippingRule(
  database: StagingDrizzleClient,
  rule: NormalizedShippingRule
): Promise<EntityUpsertResult> {
  const existing = await findShippingRuleByImportCode(database, rule.ruleCode);
  const row = {
    name: rule.name,
    provider: "manual" as const,
    ruleType: rule.uf ? "uf" : "postal_range",
    ruleValue: { ruleCode: rule.ruleCode },
    uf: rule.uf,
    postalCodeStart: rule.postalCodeStart,
    postalCodeEnd: rule.postalCodeEnd,
    price: centsToDecimal(rule.priceCents),
    priceCents: rule.priceCents,
    estimatedDays: rule.estimatedDays,
    priority: rule.priority,
    isActive: rule.isActive,
    metadata: { stagingImportRuleCode: rule.ruleCode },
    updatedAt: new Date()
  };

  if (existing) {
    await database
      .update(shippingRules)
      .set(row)
      .where(eq(shippingRules.id, existing.id));
    return result("shippingRules", rule.ruleCode, "updated");
  }

  await database.insert(shippingRules).values(row);
  return result("shippingRules", rule.ruleCode, "inserted");
}

async function resetApprovedScope(
  database: StagingDrizzleClient,
  plan: StagingImportPlan
): Promise<ResetExecutionResult> {
  const before =
    await createDrizzleStagingImportStore(database).countEntities();
  const approvedSkus = new Set(
    plan.entities.products.map((product) => product.sku)
  );
  const approvedProducts = await database.select().from(products);

  for (const product of approvedProducts.filter((candidate) =>
    approvedSkus.has(candidate.sku)
  )) {
    await database
      .delete(productImages)
      .where(eq(productImages.productId, product.id));
    await database
      .delete(productCategories)
      .where(eq(productCategories.productId, product.id));
    await database.delete(products).where(eq(products.id, product.id));
  }

  for (const coupon of plan.entities.coupons) {
    await database.delete(coupons).where(eq(coupons.code, coupon.code));
  }

  const allShipping = await database.select().from(shippingRules);
  const ruleCodes = new Set(
    plan.entities.shippingRules.map((rule) => rule.ruleCode)
  );
  for (const rule of allShipping.filter((candidate) =>
    ruleCodes.has(readShippingImportCode(candidate) ?? "")
  )) {
    await database.delete(shippingRules).where(eq(shippingRules.id, rule.id));
  }

  for (const category of plan.entities.categories) {
    await database.delete(categories).where(eq(categories.slug, category.slug));
  }

  return {
    status: "executed",
    summary: summarizeCounts("skipped", before),
    message:
      "Reset executado apenas para chaves aprovadas em staging/dev remoto."
  };
}

async function findCategoryBySlug(
  database: StagingDrizzleClient,
  slug: string
): Promise<CategoryRow | null> {
  const [row] = await database
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
}

async function findProductBySku(
  database: StagingDrizzleClient,
  sku: string
): Promise<ProductRow | null> {
  const [row] = await database
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);
  return row ?? null;
}

async function findShippingRuleByImportCode(
  database: StagingDrizzleClient,
  ruleCode: string
): Promise<ShippingRuleRow | null> {
  const rows = await database.select().from(shippingRules);
  return rows.find((row) => readShippingImportCode(row) === ruleCode) ?? null;
}

function readShippingImportCode(row: ShippingRuleRow) {
  const metadata = row.metadata;
  if (
    metadata &&
    typeof metadata === "object" &&
    "stagingImportRuleCode" in metadata
  ) {
    return String(metadata.stagingImportRuleCode);
  }
  return null;
}

function result(
  entity: ImportEntityName,
  key: string,
  status: EntityUpsertResult["status"],
  message = "Upsert staging processado."
): EntityUpsertResult {
  return { entity, key, status, message };
}

function centsToDecimal(cents: number) {
  return (cents / 100).toFixed(2);
}

function couponValueToDecimal(coupon: NormalizedCoupon) {
  if (coupon.type === "fixed_amount") {
    return centsToDecimal(coupon.value);
  }
  return String(coupon.value);
}

function summarizeCounts(
  status: EntityUpsertResult["status"],
  counts: Record<ImportEntityName, number>
) {
  return Object.entries(counts).map(([entity, count]) => ({
    entity: entity as ImportEntityName,
    input: 0,
    before: count,
    after: count,
    inserted: status === "inserted" ? count : 0,
    updated: status === "updated" ? count : 0,
    skipped: status === "skipped" ? count : 0
  }));
}
