import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { cartItems, carts } from "@/db/schema";
import { runtimeMessages } from "@/lib/runtime-mode";
import { calculateCartSubtotalCents, toCartItemSubtotal } from "../domain";
import type { CartActor, CartItem, CartView } from "../types";

type CartRow = {
  id: string;
  userId: string | null;
  guestToken: string | null;
  appliedCouponId: string | null;
  status: "active" | "converted" | "abandoned" | "expired";
  currency: string;
};

export type CartRepository = {
  getOrCreateActiveCart(actor: Exclude<CartActor, { kind: "unavailable" }>): Promise<CartView>;
  getActiveCart(actor: Exclude<CartActor, { kind: "unavailable" }>): Promise<CartView>;
  addItem(
    actor: Exclude<CartActor, { kind: "unavailable" }>,
    item: { productId: string; productNameSnapshot: string; unitPriceSnapshotCents: number; quantity: number }
  ): Promise<CartView>;
  updateItemQuantity(
    actor: Exclude<CartActor, { kind: "unavailable" }>,
    itemId: string,
    quantity: number
  ): Promise<CartView | null>;
  removeItem(actor: Exclude<CartActor, { kind: "unavailable" }>, itemId: string): Promise<CartView>;
  clearCart(actor: Exclude<CartActor, { kind: "unavailable" }>): Promise<CartView>;
  setAppliedCoupon(
    actor: Exclude<CartActor, { kind: "unavailable" }>,
    couponId: string
  ): Promise<CartView>;
  clearAppliedCoupon(actor: Exclude<CartActor, { kind: "unavailable" }>): Promise<CartView>;
  markCartConverted(cartId: string): Promise<void>;
};

export function createCartRepository(): CartRepository {
  if (db === null) {
    return createFallbackCartRepository();
  }

  return createDrizzleCartRepository();
}

function createFallbackCartRepository(): CartRepository {
  const fallbackCarts = getFallbackStore();

  return {
    async getOrCreateActiveCart(actor) {
      return getOrCreateFallbackCart(actor, fallbackCarts);
    },
    async getActiveCart(actor) {
      return getFallbackCart(actor, fallbackCarts) ?? emptyFallbackCart(actor);
    },
    async addItem(actor, item) {
      const cart = getOrCreateFallbackCart(actor, fallbackCarts);
      const existing = cart.items.find((cartItem) => cartItem.productId === item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.itemSubtotalCents = existing.unitPriceSnapshotCents * existing.quantity;
      } else {
        cart.items.push(
          toCartItemSubtotal({
            id: `dev-item-${item.productId}`,
            productId: item.productId,
            productNameSnapshot: item.productNameSnapshot,
            unitPriceSnapshotCents: item.unitPriceSnapshotCents,
            quantity: item.quantity
          })
        );
      }
      return recalculateFallbackCart(cart);
    },
    async updateItemQuantity(actor, itemId, quantity) {
      const cart = getFallbackCart(actor, fallbackCarts);
      if (!cart) {
        return null;
      }
      const item = cart.items.find((cartItem) => cartItem.id === itemId);
      if (!item) {
        return null;
      }
      item.quantity = quantity;
      item.itemSubtotalCents = item.unitPriceSnapshotCents * quantity;
      return recalculateFallbackCart(cart);
    },
    async removeItem(actor, itemId) {
      const cart = getOrCreateFallbackCart(actor, fallbackCarts);
      cart.items = cart.items.filter((item) => item.id !== itemId);
      return recalculateFallbackCart(cart);
    },
    async clearCart(actor) {
      const cart = getOrCreateFallbackCart(actor, fallbackCarts);
      cart.items = [];
      cart.appliedCouponId = null;
      cart.coupon = null;
      cart.discountCents = 0;
      cart.partialTotalCents = 0;
      return recalculateFallbackCart(cart);
    },
    async setAppliedCoupon(actor, couponId) {
      const cart = getOrCreateFallbackCart(actor, fallbackCarts);
      cart.appliedCouponId = couponId;
      return recalculateFallbackCart(cart);
    },
    async clearAppliedCoupon(actor) {
      const cart = getOrCreateFallbackCart(actor, fallbackCarts);
      cart.appliedCouponId = null;
      cart.coupon = null;
      cart.discountCents = 0;
      return recalculateFallbackCart(cart);
    },
    async markCartConverted(cartId) {
      for (const cart of fallbackCarts.values()) {
        if (cart.id === cartId) {
          cart.status = "converted";
          cart.items = [];
        }
      }
    }
  };
}

function createDrizzleCartRepository(): CartRepository {
  if (db === null) {
    return createFallbackCartRepository();
  }

  const database = db;

  return {
    async getOrCreateActiveCart(actor) {
      const active = await findActiveCart(actor);
      if (active) {
        return toCartView(active, await listCartItems(active.id), "real");
      }

      const [created] = await database
        .insert(carts)
        .values(toCartInsert(actor))
        .returning({
          id: carts.id,
          userId: carts.userId,
          guestToken: carts.guestToken,
          appliedCouponId: carts.appliedCouponId,
          status: carts.status,
          currency: carts.currency
        });

      return toCartView(created, [], "real");
    },
    async getActiveCart(actor) {
      const active = await findActiveCart(actor);
      if (!active) {
        return emptyRealCart(actor);
      }
      return toCartView(active, await listCartItems(active.id), "real");
    },
    async addItem(actor, item) {
      const cart = await this.getOrCreateActiveCart(actor);
      if (cart.id === null) {
        return cart;
      }

      const existing = cart.items.find((cartItem) => cartItem.productId === item.productId);
      if (existing) {
        await database
          .update(cartItems)
          .set({
            productNameSnapshot: item.productNameSnapshot,
            unitPriceSnapshot: (item.unitPriceSnapshotCents / 100).toFixed(2),
            unitPriceSnapshotCents: item.unitPriceSnapshotCents,
            quantity: existing.quantity + item.quantity,
            updatedAt: new Date()
          })
          .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.id, existing.id)));
      } else {
        await database.insert(cartItems).values({
          cartId: cart.id,
          productId: item.productId,
          productNameSnapshot: item.productNameSnapshot,
          unitPriceSnapshot: (item.unitPriceSnapshotCents / 100).toFixed(2),
          unitPriceSnapshotCents: item.unitPriceSnapshotCents,
          quantity: item.quantity
        });
      }

      await touchCart(cart.id);
      return this.getActiveCart(actor);
    },
    async updateItemQuantity(actor, itemId, quantity) {
      const cart = await findActiveCart(actor);
      if (!cart) {
        return null;
      }

      const [updated] = await database
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.id, itemId)))
        .returning({ id: cartItems.id });

      if (!updated) {
        return null;
      }

      await touchCart(cart.id);
      return this.getActiveCart(actor);
    },
    async removeItem(actor, itemId) {
      const cart = await this.getOrCreateActiveCart(actor);
      if (cart.id === null) {
        return cart;
      }
      await database.delete(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.id, itemId)));
      await touchCart(cart.id);
      return this.getActiveCart(actor);
    },
    async clearCart(actor) {
      const cart = await this.getOrCreateActiveCart(actor);
      if (cart.id === null) {
        return cart;
      }
      await database.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      await database
        .update(carts)
        .set({ appliedCouponId: null, updatedAt: new Date() })
        .where(eq(carts.id, cart.id));
      await touchCart(cart.id);
      return this.getActiveCart(actor);
    },
    async markCartConverted(cartId) {
      await database
        .update(carts)
        .set({
          status: "converted",
          appliedCouponId: null,
          convertedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(carts.id, cartId));
    },
    async setAppliedCoupon(actor, couponId) {
      const cart = await this.getOrCreateActiveCart(actor);
      if (cart.id === null) {
        return cart;
      }

      await database
        .update(carts)
        .set({ appliedCouponId: couponId, updatedAt: new Date() })
        .where(eq(carts.id, cart.id));

      return this.getActiveCart(actor);
    },
    async clearAppliedCoupon(actor) {
      const cart = await this.getOrCreateActiveCart(actor);
      if (cart.id === null) {
        return cart;
      }

      await database
        .update(carts)
        .set({ appliedCouponId: null, updatedAt: new Date() })
        .where(eq(carts.id, cart.id));

      return this.getActiveCart(actor);
    }
  };

  async function findActiveCart(actor: Exclude<CartActor, { kind: "unavailable" }>): Promise<CartRow | null> {
    const where =
      actor.kind === "authenticated"
        ? and(eq(carts.userId, actor.userId), eq(carts.status, "active"))
        : and(eq(carts.guestToken, actor.guestToken), eq(carts.status, "active"));

    const [row] = await database
      .select({
        id: carts.id,
        userId: carts.userId,
        guestToken: carts.guestToken,
        appliedCouponId: carts.appliedCouponId,
        status: carts.status,
        currency: carts.currency
      })
      .from(carts)
      .where(where)
      .limit(1);

    return row ?? null;
  }

  async function listCartItems(cartId: string): Promise<CartItem[]> {
    const rows = await database.select().from(cartItems).where(eq(cartItems.cartId, cartId));
    return rows.map((row) =>
      toCartItemSubtotal({
        id: row.id,
        productId: row.productId,
        productNameSnapshot: row.productNameSnapshot,
        unitPriceSnapshotCents: row.unitPriceSnapshotCents,
        quantity: row.quantity
      })
    );
  }

  async function touchCart(cartId: string) {
    await database.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
  }
}

function toCartInsert(actor: Exclude<CartActor, { kind: "unavailable" }>) {
  if (actor.kind === "authenticated") {
    return {
      userId: actor.userId,
      guestToken: null,
      sessionId: null,
      status: "active" as const,
      currency: "BRL"
    };
  }

  return {
    userId: null,
    guestToken: actor.guestToken,
    sessionId: actor.guestToken,
    status: "active" as const,
    currency: "BRL",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  };
}

function toCartView(
  cart: CartRow,
  items: CartItem[],
  persistence: "real" | "dev_fallback"
): CartView {
  return {
    id: cart.id,
    status: cart.status,
    owner:
      cart.userId !== null
        ? { kind: "user", userId: cart.userId }
        : { kind: "guest", guestTokenPresent: true },
    currency: "BRL",
    items,
    subtotalCents: calculateCartSubtotalCents(items),
    appliedCouponId: cart.appliedCouponId,
    coupon: null,
    discountCents: 0,
    partialTotalCents: calculateCartSubtotalCents(items),
    persistence,
    messages: persistence === "dev_fallback" ? [runtimeMessages.cartFallbackNotPersisted] : []
  };
}

function emptyRealCart(actor: Exclude<CartActor, { kind: "unavailable" }>): CartView {
  return {
    id: null,
    status: "active",
    owner: actor.kind === "authenticated" ? { kind: "user", userId: actor.userId } : { kind: "guest", guestTokenPresent: true },
    currency: "BRL",
    items: [],
    subtotalCents: 0,
    appliedCouponId: null,
    coupon: null,
    discountCents: 0,
    partialTotalCents: 0,
    persistence: "real",
    messages: []
  };
}

function emptyFallbackCart(actor: Exclude<CartActor, { kind: "unavailable" }>): CartView {
  return {
    ...emptyRealCart(actor),
    persistence: "dev_fallback",
    messages: [runtimeMessages.cartFallbackNotPersisted]
  };
}

function fallbackKey(actor: Exclude<CartActor, { kind: "unavailable" }>) {
  return actor.kind === "authenticated" ? `user:${actor.userId}` : `guest:${actor.guestToken}`;
}

function getFallbackCart(
  actor: Exclude<CartActor, { kind: "unavailable" }>,
  store: Map<string, CartView>
) {
  return store.get(fallbackKey(actor)) ?? null;
}

function getOrCreateFallbackCart(
  actor: Exclude<CartActor, { kind: "unavailable" }>,
  store: Map<string, CartView>
) {
  const key = fallbackKey(actor);
  const existing = store.get(key);
  if (existing) {
    return existing;
  }
  const created = {
    ...emptyFallbackCart(actor),
    id: `dev-cart-${key}`
  };
  store.set(key, created);
  return created;
}

function recalculateFallbackCart(cart: CartView) {
  cart.subtotalCents = calculateCartSubtotalCents(cart.items);
  cart.partialTotalCents = cart.subtotalCents - cart.discountCents;
  cart.messages = [runtimeMessages.cartFallbackNotPersisted];
  return cart;
}

function getFallbackStore() {
  const globalStore = globalThis as typeof globalThis & {
    __triadeCartFallbackStore?: Map<string, CartView>;
  };
  globalStore.__triadeCartFallbackStore ??= new Map<string, CartView>();
  return globalStore.__triadeCartFallbackStore;
}
