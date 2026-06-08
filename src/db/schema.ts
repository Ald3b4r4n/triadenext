import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

const idColumn = () => uuid("id").primaryKey().defaultRandom();
const createdAtColumn = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAtColumn = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const userRole = pgEnum("user_role", ["customer", "admin", "manager"]);
export const productStatus = pgEnum("product_status", [
  "draft",
  "published",
  "inactive"
]);
export const cartStatus = pgEnum("cart_status", ["active", "converted", "abandoned", "expired"]);
export const couponType = pgEnum("coupon_type", [
  "percentage",
  "fixed_amount",
  "free_shipping"
]);
export const orderStatus = pgEnum("order_status", [
  "aguardando_pagamento",
  "pago",
  "em_preparacao",
  "enviado",
  "entregue",
  "cancelado",
  "expirado",
  "reembolsado"
]);
export const paymentStatus = pgEnum("payment_status", [
  "pendente",
  "pago",
  "falhou",
  "cancelado",
  "reembolsado"
]);
export const fulfillmentStatus = pgEnum("fulfillment_status", [
  "unfulfilled",
  "preparing",
  "shipped",
  "delivered",
  "cancelled"
]);
export const shippingProvider = pgEnum("shipping_provider", [
  "manual",
  "melhor_envio",
  "jadlog",
  "correios"
]);
export const fiscalDocumentType = pgEnum("fiscal_document_type", [
  "invoice",
  "receipt",
  "other"
]);

export const users = pgTable(
  "users",
  {
    id: idColumn(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    phone: text("phone"),
    passwordHash: text("password_hash"),
    role: userRole("role").notNull().default("customer"),
    mustChangePassword: boolean("must_change_password").notNull().default(false),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    roleIdx: index("users_role_idx").on(table.role)
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: idColumn(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
  },
  (table) => ({
    tokenUnique: uniqueIndex("sessions_token_unique").on(table.token),
    userIdx: index("sessions_user_id_idx").on(table.userId)
  })
);

export const accounts = pgTable(
  "accounts",
  {
    id: idColumn(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => ({
    userIdx: index("accounts_user_id_idx").on(table.userId),
    providerAccountUnique: uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId
    )
  })
);

export const verifications = pgTable(
  "verifications",
  {
    id: idColumn(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => ({
    identifierIdx: index("verifications_identifier_idx").on(table.identifier)
  })
);

export const customerProfiles = pgTable("customer_profiles", {
  id: idColumn(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cpf: text("cpf"),
  documentType: text("document_type"),
  birthDate: date("birth_date"),
  privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at", { withTimezone: true }),
  marketingOptInAt: timestamp("marketing_opt_in_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});

export const addresses = pgTable("addresses", {
  id: idColumn(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label"),
  recipient: text("recipient").notNull(),
  phone: text("phone"),
  postalCode: text("postal_code").notNull(),
  street: text("street").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  district: text("district"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("BR"),
  isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});

export const categories = pgTable(
  "categories",
  {
    id: idColumn(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    parentId: uuid("parent_id"),
    type: text("type"),
    isActive: boolean("is_active").notNull().default(true),
    isProtected: boolean("is_protected").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => ({
    slugUnique: uniqueIndex("categories_slug_unique").on(table.slug),
    activeSortIdx: index("categories_active_sort_idx").on(table.isActive, table.sortOrder)
  })
);

export const products = pgTable(
  "products",
  {
    id: idColumn(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku").notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    brand: text("brand"),
    inspirationName: text("inspiration_name"),
    gender: text("gender"),
    concentration: text("concentration"),
    volumeMl: integer("volume_ml"),
    dimensions: jsonb("dimensions"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
    priceCents: integer("price_cents").notNull().default(0),
    compareAtPriceCents: integer("compare_at_price_cents"),
    costPriceCents: integer("cost_price_cents"),
    status: productStatus("status").notNull().default("draft"),
    availabilityType: text("availability_type").notNull().default("ready_stock"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    blingId: text("bling_id"),
    blingSyncStatus: text("bling_sync_status"),
    blingSyncedAt: timestamp("bling_synced_at", { withTimezone: true }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => ({
    slugUnique: uniqueIndex("products_slug_unique").on(table.slug),
    skuUnique: uniqueIndex("products_sku_unique").on(table.sku),
    publicCatalogIdx: index("products_public_catalog_idx").on(
      table.status,
      table.publishedAt,
      table.stockQuantity
    ),
    featuredIdx: index("products_featured_idx").on(table.isFeatured)
  })
);

export const productImages = pgTable(
  "product_images",
  {
    id: idColumn(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    blobUrl: text("blob_url").notNull(),
    pathname: text("pathname").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    isCover: boolean("is_cover").notNull().default(false),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes"),
    contentType: text("content_type"),
    createdAt: createdAtColumn()
  },
  (table) => ({
    productSortIdx: index("product_images_product_sort_idx").on(table.productId, table.sortOrder),
    productCoverUnique: uniqueIndex("product_images_one_cover_unique")
      .on(table.productId)
      .where(sql`${table.isCover}`)
  })
);

export const productCategories = pgTable(
  "product_categories",
  {
    id: idColumn(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => ({
    productCategoryUnique: uniqueIndex("product_categories_product_category_unique").on(
      table.productId,
      table.categoryId
    )
  })
);

export const carts = pgTable(
  "carts",
  {
    id: idColumn(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    guestToken: text("guest_token"),
    sessionId: text("session_id"),
    status: cartStatus("status").notNull().default("active"),
    currency: text("currency").notNull().default("BRL"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    convertedAt: timestamp("converted_at", { withTimezone: true }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => ({
    userStatusIdx: index("carts_user_status_idx").on(table.userId, table.status),
    guestStatusIdx: index("carts_guest_status_idx").on(table.guestToken, table.status),
    sessionStatusIdx: index("carts_session_status_idx").on(table.sessionId, table.status)
  })
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: idColumn(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    unitPriceSnapshot: numeric("unit_price_snapshot", { precision: 12, scale: 2 }).notNull(),
    unitPriceSnapshotCents: integer("unit_price_snapshot_cents").notNull().default(0),
    quantity: integer("quantity").notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn()
  },
  (table) => ({
    cartProductUnique: uniqueIndex("cart_items_cart_product_unique").on(
      table.cartId,
      table.productId
    ),
    cartIdx: index("cart_items_cart_id_idx").on(table.cartId)
  })
);

export const coupons = pgTable("coupons", {
  id: idColumn(),
  code: text("code").notNull(),
  type: couponType("type").notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});

export const shippingRules = pgTable("shipping_rules", {
  id: idColumn(),
  name: text("name").notNull(),
  provider: shippingProvider("provider").notNull().default("manual"),
  ruleType: text("rule_type").notNull(),
  ruleValue: jsonb("rule_value"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  estimatedDays: integer("estimated_days"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});

export const orders = pgTable("orders", {
  id: idColumn(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  number: text("number").notNull(),
  status: orderStatus("status").notNull().default("aguardando_pagamento"),
  fulfillmentStatus: fulfillmentStatus("fulfillment_status").notNull().default("unfulfilled"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  shippingTotal: numeric("shipping_total", { precision: 12, scale: 2 }).notNull().default("0"),
  discountTotal: numeric("discount_total", { precision: 12, scale: 2 }).notNull().default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  customerSnapshot: jsonb("customer_snapshot").notNull(),
  shippingAddressSnapshot: jsonb("shipping_address_snapshot").notNull(),
  shippingSnapshot: jsonb("shipping_snapshot"),
  publicToken: text("public_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  placedAt: timestamp("placed_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  blingOrderId: text("bling_order_id"),
  fiscalDocumentStatus: text("fiscal_document_status"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});

export const orderItems = pgTable("order_items", {
  id: idColumn(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  skuSnapshot: text("sku_snapshot").notNull(),
  nameSnapshot: text("name_snapshot").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  createdAt: createdAtColumn()
});

export const orderEvents = pgTable("order_events", {
  id: idColumn(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  payload: jsonb("payload"),
  createdAt: createdAtColumn()
});

export const paymentIntents = pgTable("payment_intents", {
  id: idColumn(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("stripe"),
  providerReference: text("provider_reference"),
  checkoutSessionId: text("checkout_session_id"),
  status: paymentStatus("status").notNull().default("pendente"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  failureReason: text("failure_reason"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});

export const paymentEvents = pgTable("payment_events", {
  id: idColumn(),
  paymentIntentId: uuid("payment_intent_id").references(() => paymentIntents.id, {
    onDelete: "set null"
  }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  signatureValid: boolean("signature_valid").notNull().default(false),
  payload: jsonb("payload"),
  processingStatus: text("processing_status").notNull().default("received"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  failureReason: text("failure_reason"),
  createdAt: createdAtColumn()
});

export const fiscalDocuments = pgTable("fiscal_documents", {
  id: idColumn(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").references(() => users.id, { onDelete: "set null" }),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, {
    onDelete: "set null"
  }),
  blobUrl: text("blob_url").notNull(),
  pathname: text("pathname").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes"),
  type: fiscalDocumentType("type").notNull().default("invoice"),
  documentNumber: text("document_number"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});

export const adminNotifications = pgTable("admin_notifications", {
  id: idColumn(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  channel: text("channel").notNull().default("internal"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedModelType: text("related_model_type"),
  relatedModelId: uuid("related_model_id"),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  failedAt: timestamp("failed_at", { withTimezone: true }),
  failureReason: text("failure_reason"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn()
});
