import "server-only";

import { runtimeMessages } from "@/lib/runtime-mode";
import { isProductAvailableForPurchase } from "@/features/products/domain";
import { createProductRepository } from "@/features/products/server/product-repository";
import {
  calculateCartSubtotalCents,
  validatePurchasableProduct,
  validateQuantityForStock
} from "../domain";
import {
  calculateAppliedCoupon,
  validateCouponForCart
} from "@/features/coupons/server/coupon-service";
import type { CartActionResult, CartActor, CartItem, CartView } from "../types";
import { createCartRepository } from "./cart-repository";
import { resolveCartActor } from "./cart-session";

const cartRepository = createCartRepository();
const productRepository = createProductRepository();

export async function getActiveCart(): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  return toResult(await recalculateCartForActor(actor, await cartRepository.getActiveCart(actor)));
}

export async function addItemToCart(input: { productId: string; quantity: number }): Promise<CartActionResult> {
  const actor = await resolveCartActor({ createGuestToken: true });
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  const product = await productRepository.findProductById(input.productId);
  const productValidation = validatePurchasableProduct(product);
  if (productValidation.status !== "available") {
    return { status: "product_unavailable", message: runtimeMessages.cartProductUnavailable };
  }

  const currentCart = await cartRepository.getActiveCart(actor);
  const currentQuantity =
    currentCart.items.find((item) => item.productId === input.productId)?.quantity ?? 0;
  const quantityValidation = validateQuantityForStock(
    currentQuantity + input.quantity,
    productValidation.product.stockQuantity
  );

  if (quantityValidation.status === "invalid") {
    return { status: "validation_error", message: "Quantidade invalida." };
  }

  if (quantityValidation.status === "insufficient_stock") {
    return {
      status: "insufficient_stock",
      message: runtimeMessages.cartInsufficientStock,
      maxQuantity: quantityValidation.maxQuantity
    };
  }

  return toResult(
    await recalculateCartForActor(actor, await cartRepository.addItem(actor, {
      productId: productValidation.product.id,
      productNameSnapshot: productValidation.product.name,
      unitPriceSnapshotCents: productValidation.product.priceCents,
      quantity: input.quantity
    }))
  );
}

export async function updateCartItemQuantity(input: {
  itemId: string;
  quantity: number;
}): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  const cart = await cartRepository.getActiveCart(actor);
  const item = cart.items.find((cartItem) => cartItem.id === input.itemId);
  if (!item) {
    return { status: "forbidden", message: runtimeMessages.cartForbidden };
  }

  const product = await productRepository.findProductById(item.productId);
  const productValidation = validatePurchasableProduct(product);
  if (productValidation.status !== "available") {
    return { status: "product_unavailable", message: runtimeMessages.cartProductUnavailable };
  }

  const quantityValidation = validateQuantityForStock(
    input.quantity,
    productValidation.product.stockQuantity
  );

  if (quantityValidation.status === "invalid") {
    return { status: "validation_error", message: "Quantidade invalida." };
  }

  if (quantityValidation.status === "insufficient_stock") {
    return {
      status: "insufficient_stock",
      message: runtimeMessages.cartInsufficientStock,
      maxQuantity: quantityValidation.maxQuantity
    };
  }

  const updated = await cartRepository.updateItemQuantity(actor, input.itemId, input.quantity);
  if (updated === null) {
    return { status: "forbidden", message: runtimeMessages.cartForbidden };
  }

  return toResult(await recalculateCartForActor(actor, updated));
}

export async function removeCartItem(itemId: string): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  return toResult(await recalculateCartForActor(actor, await cartRepository.removeItem(actor, itemId)));
}

export async function clearActiveCart(): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  return toResult(await recalculateCartForActor(actor, await cartRepository.clearCart(actor)));
}

export async function applyCouponToActiveCart(code: string): Promise<CartActionResult> {
  const actor = await resolveCartActor({ createGuestToken: true });
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  const cart = await recalculateCartView(await cartRepository.getOrCreateActiveCart(actor));
  const validation = await validateCouponForCart({ code, subtotalCents: cart.subtotalCents });

  if (validation.status !== "valid") {
    return {
      status: "coupon_invalid",
      message: validation.message,
      cart
    };
  }

  const updated = await cartRepository.setAppliedCoupon(actor, validation.coupon.id);
  return toResult(await recalculateCartForActor(actor, updated));
}

export async function removeCouponFromActiveCart(): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  const updated = await cartRepository.clearAppliedCoupon(actor);
  return toResult(await recalculateCartForActor(actor, updated));
}

export async function mergeGuestCartIntoUser(input: {
  userId: string;
  guestToken: string | null;
}): Promise<CartActionResult> {
  if (!input.guestToken) {
    return getActiveCart();
  }

  const guestActor: CartActor = { kind: "guest", guestToken: input.guestToken };
  const userActor: CartActor = { kind: "authenticated", userId: input.userId, role: "customer" };

  const guestCart = await cartRepository.getActiveCart(guestActor);
  const guestCouponId = guestCart.appliedCouponId;
  if (guestCart.id === null || guestCart.items.length === 0) {
    return toResult(await recalculateCartForActor(userActor, await cartRepository.getOrCreateActiveCart(userActor)));
  }

  await cartRepository.getOrCreateActiveCart(userActor);
  const warnings: string[] = [];

  for (const item of guestCart.items) {
    const product = await productRepository.findProductById(item.productId);
    if (!product || !isProductAvailableForPurchase(product)) {
      warnings.push(`Item indisponivel removido do merge: ${item.productNameSnapshot}.`);
      continue;
    }

    const userCart = await cartRepository.getActiveCart(userActor);
    const existingQuantity =
      userCart.items.find((userItem) => userItem.productId === item.productId)?.quantity ?? 0;
    const allowedQuantity = Math.min(item.quantity, Math.max(product.stockQuantity - existingQuantity, 0));

    if (allowedQuantity <= 0) {
      warnings.push(`Estoque indisponivel para ${item.productNameSnapshot}.`);
      continue;
    }

    if (allowedQuantity < item.quantity) {
      warnings.push(`Quantidade de ${item.productNameSnapshot} limitada ao estoque disponivel.`);
    }

    await cartRepository.addItem(userActor, {
      productId: product.id,
      productNameSnapshot: product.name,
      unitPriceSnapshotCents: product.priceCents,
      quantity: allowedQuantity
    });
  }

  if (guestCart.id !== null) {
    await cartRepository.markCartConverted(guestCart.id);
  }

  let merged = await cartRepository.getActiveCart(userActor);
  if (guestCouponId && merged.appliedCouponId === null) {
    merged = await cartRepository.setAppliedCoupon(userActor, guestCouponId);
  }

  const recalculated = await recalculateCartForActor(userActor, merged);
  return toResult({ ...recalculated, messages: [...recalculated.messages, ...warnings] });
}

export async function recalculateCartView(cart: CartView): Promise<CartView> {
  const items: CartItem[] = [];
  const messages = [...cart.messages];

  for (const item of cart.items) {
    const product = await productRepository.findProductById(item.productId);
    if (!product || !isProductAvailableForPurchase(product)) {
      messages.push(`${item.productNameSnapshot} nao esta disponivel para compra.`);
      continue;
    }

    if (item.quantity > product.stockQuantity) {
      messages.push(`${item.productNameSnapshot} excede o estoque disponivel.`);
      items.push({ ...item, quantity: product.stockQuantity, itemSubtotalCents: item.unitPriceSnapshotCents * product.stockQuantity });
      continue;
    }

    items.push(item);
  }

  const subtotalCents = calculateCartSubtotalCents(items);
  if (cart.appliedCouponId === null) {
    return {
      ...cart,
      items,
      subtotalCents,
      coupon: null,
      discountCents: 0,
      partialTotalCents: subtotalCents,
      messages
    };
  }

  const couponCalculation = await calculateAppliedCoupon({
    couponId: cart.appliedCouponId,
    subtotalCents
  });

  return {
    ...cart,
    items,
    subtotalCents,
    coupon: couponCalculation.coupon,
    discountCents: couponCalculation.discountCents,
    partialTotalCents: couponCalculation.partialTotalCents,
    messages: [...messages, ...couponCalculation.messages]
  };
}

async function recalculateCartForActor(
  actor: Exclude<CartActor, { kind: "unavailable" }>,
  cart: CartView
) {
  const recalculated = await recalculateCartView(cart);
  const hasInvalidAppliedCoupon =
    cart.appliedCouponId !== null && recalculated.discountCents === 0 && recalculated.messages.length > cart.messages.length;

  if (hasInvalidAppliedCoupon) {
    const cleared = await cartRepository.clearAppliedCoupon(actor);
    return {
      ...(await recalculateCartView(cleared)),
      messages: recalculated.messages
    };
  }

  return recalculated;
}

function toResult(cart: CartView): CartActionResult {
  if (cart.persistence === "dev_fallback") {
    return { status: "fallback", cart, message: runtimeMessages.cartFallbackNotPersisted };
  }

  return { status: "success", cart, message: runtimeMessages.cartUpdated };
}
