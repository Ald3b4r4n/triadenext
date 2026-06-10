import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { carts, orderItems, orders } from "@/db/schema";
import { getRuntimeMode, runtimeMessages } from "@/lib/runtime-mode";
import { centsToDecimal, createOrderNumber, createPublicToken } from "../domain";
import type { PendingOrder, PendingOrderDraft, PendingOrderItem } from "../types";

export type OrderRepository = {
  createPendingOrder(input: PendingOrderDraft): Promise<OrderPersistenceResult>;
  listCustomerPendingOrders(userId: string): Promise<PendingOrder[]>;
  getCustomerOrder(userId: string, orderId: string): Promise<PendingOrder | null>;
  listAdminPendingOrders(): Promise<PendingOrder[]>;
  getAdminOrder(orderId: string): Promise<PendingOrder | null>;
};

export type OrderPersistenceResult =
  | { status: "persisted"; order: PendingOrder; message: string }
  | { status: "dev_fallback"; order: PendingOrder; message: string }
  | { status: "unavailable"; order: null; message: string };

export function createOrderRepository(): OrderRepository {
  return db === null ? createFallbackOrderRepository() : createDrizzleOrderRepository();
}

function createFallbackOrderRepository(): OrderRepository {
  const store = getFallbackOrderStore();

  return {
    async createPendingOrder(input) {
      const mode = getRuntimeMode();
      if (mode.appEnvironment !== "development" && mode.appEnvironment !== "test") {
        return {
          status: "unavailable",
          order: null,
          message: runtimeMessages.checkoutUnavailable
        };
      }

      const existing = [...store.values()].find((order) => order.cartId === input.cartId);
      if (existing) {
        return {
          status: "dev_fallback",
          order: existing,
          message: "Pedido pendente fixture ja existia para este carrinho convertido."
        };
      }

      const order = toPendingOrder(input, "dev_fallback");
      store.set(order.id, order);
      return {
        status: "dev_fallback",
        order,
        message: runtimeMessages.checkoutFallback
      };
    },
    async listCustomerPendingOrders(userId) {
      return [...store.values()].filter(
        (order) => order.userId === userId && order.status === "aguardando_pagamento"
      );
    },
    async getCustomerOrder(userId, orderId) {
      const order = store.get(orderId) ?? null;
      return order?.userId === userId ? order : null;
    },
    async listAdminPendingOrders() {
      return [...store.values()].filter((order) => order.status === "aguardando_pagamento");
    },
    async getAdminOrder(orderId) {
      return store.get(orderId) ?? null;
    }
  };
}

function createDrizzleOrderRepository(): OrderRepository {
  if (db === null) {
    return createFallbackOrderRepository();
  }

  const database = db;

  return {
    async createPendingOrder(input) {
      const existing = await findByCartId(input.cartId);
      if (existing) {
        return {
          status: "persisted",
          order: existing,
          message: "Pedido pendente ja existia para este carrinho convertido."
        };
      }

      const order = await database.transaction(async (tx) => {
        const now = input.createdAt;
        const [created] = await tx
          .insert(orders)
          .values({
            userId: input.userId,
            cartId: input.cartId,
            number: createOrderNumber(now),
            status: "aguardando_pagamento",
            fulfillmentStatus: "unfulfilled",
            subtotal: centsToDecimal(input.subtotalCents),
            subtotalCents: input.subtotalCents,
            shippingTotal: centsToDecimal(input.shippingTotalCents),
            shippingTotalCents: input.shippingTotalCents,
            discountTotal: centsToDecimal(input.discountTotalCents),
            discountTotalCents: input.discountTotalCents,
            grandTotal: centsToDecimal(input.grandTotalCents),
            grandTotalCents: input.grandTotalCents,
            currency: input.currency,
            customerSnapshot: input.customerSnapshot,
            shippingAddressSnapshot: input.shippingAddressSnapshot,
            shippingSnapshot: input.shippingSnapshot,
            couponSnapshot: input.couponSnapshot,
            publicToken: createPublicToken(),
            expiresAt: input.expiresAt,
            placedAt: now,
            createdAt: now,
            updatedAt: now
          })
          .returning();

        if (input.items.length > 0) {
          await tx.insert(orderItems).values(
            input.items.map((item) => ({
              orderId: created.id,
              productId: item.productId,
              skuSnapshot: item.skuSnapshot,
              nameSnapshot: item.nameSnapshot,
              slugSnapshot: item.slugSnapshot,
              imageSnapshot: item.imageSnapshot,
              unitPrice: centsToDecimal(item.unitPriceCents),
              unitPriceCents: item.unitPriceCents,
              quantity: item.quantity,
              lineTotal: centsToDecimal(item.lineTotalCents),
              lineTotalCents: item.lineTotalCents,
              createdAt: now
            }))
          );
        }

        await tx
          .update(carts)
          .set({
            status: "converted",
            convertedAt: now,
            updatedAt: now
          })
          .where(and(eq(carts.id, input.cartId), eq(carts.userId, input.userId), eq(carts.status, "active")));

        return created;
      });

      const hydrated = await findById(order.id);
      return {
        status: "persisted",
        order: hydrated ?? toPendingOrder(input, "real", { id: order.id, number: order.number, publicToken: order.publicToken }),
        message: "Pedido pendente criado."
      };
    },
    async listCustomerPendingOrders(userId) {
      const rows = await database
        .select()
        .from(orders)
        .where(and(eq(orders.userId, userId), eq(orders.status, "aguardando_pagamento")))
        .orderBy(desc(orders.createdAt));
      return hydrateOrderRows(rows);
    },
    async getCustomerOrder(userId, orderId) {
      const [row] = await database
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .limit(1);
      return row ? (await hydrateOrderRows([row]))[0] ?? null : null;
    },
    async listAdminPendingOrders() {
      const rows = await database
        .select()
        .from(orders)
        .where(eq(orders.status, "aguardando_pagamento"))
        .orderBy(desc(orders.createdAt));
      return hydrateOrderRows(rows);
    },
    async getAdminOrder(orderId) {
      return findById(orderId);
    }
  };

  async function findByCartId(cartId: string) {
    const [row] = await database.select().from(orders).where(eq(orders.cartId, cartId)).limit(1);
    return row ? (await hydrateOrderRows([row]))[0] ?? null : null;
  }

  async function findById(orderId: string) {
    const [row] = await database.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    return row ? (await hydrateOrderRows([row]))[0] ?? null : null;
  }

  async function hydrateOrderRows(rows: Array<typeof orders.$inferSelect>): Promise<PendingOrder[]> {
    if (rows.length === 0) {
      return [];
    }

    const hydrated: PendingOrder[] = [];
    for (const row of rows) {
      const items = await database.select().from(orderItems).where(eq(orderItems.orderId, row.id));
      hydrated.push(toPendingOrderFromRows(row, items));
    }
    return hydrated;
  }
}

function toPendingOrder(
  input: PendingOrderDraft,
  persistence: "real" | "dev_fallback",
  identity?: { id: string; number: string; publicToken: string }
): PendingOrder {
  const id = identity?.id ?? `dev-order-${input.cartId}-${Date.now()}`;
  return {
    ...input,
    id,
    number: identity?.number ?? createOrderNumber(input.createdAt),
    publicToken: identity?.publicToken ?? createPublicToken(),
    items: input.items.map((item, index) => ({
      ...item,
      id: `${id}-item-${index + 1}`,
      orderId: id
    })),
    persistence
  };
}

function toPendingOrderFromRows(
  row: typeof orders.$inferSelect,
  itemRows: Array<typeof orderItems.$inferSelect>
): PendingOrder {
  return {
    id: row.id,
    userId: row.userId ?? "",
    cartId: row.cartId ?? "",
    number: row.number,
    status: "aguardando_pagamento",
    subtotalCents: row.subtotalCents,
    discountTotalCents: row.discountTotalCents,
    shippingTotalCents: row.shippingTotalCents,
    grandTotalCents: row.grandTotalCents,
    currency: "BRL",
    customerSnapshot: row.customerSnapshot as PendingOrder["customerSnapshot"],
    shippingAddressSnapshot: row.shippingAddressSnapshot as PendingOrder["shippingAddressSnapshot"],
    shippingSnapshot: row.shippingSnapshot as PendingOrder["shippingSnapshot"],
    couponSnapshot: row.couponSnapshot as PendingOrder["couponSnapshot"],
    items: itemRows.map(toPendingOrderItem),
    publicToken: row.publicToken,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt ?? row.createdAt,
    persistence: "real"
  };
}

function toPendingOrderItem(row: typeof orderItems.$inferSelect): PendingOrderItem {
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    skuSnapshot: row.skuSnapshot,
    nameSnapshot: row.nameSnapshot,
    slugSnapshot: row.slugSnapshot,
    imageSnapshot: row.imageSnapshot,
    unitPriceCents: row.unitPriceCents,
    quantity: row.quantity,
    lineTotalCents: row.lineTotalCents
  };
}

function getFallbackOrderStore() {
  const globalStore = globalThis as typeof globalThis & {
    __triadeOrderFallbackStore?: Map<string, PendingOrder>;
  };
  globalStore.__triadeOrderFallbackStore ??= new Map<string, PendingOrder>();
  return globalStore.__triadeOrderFallbackStore;
}
