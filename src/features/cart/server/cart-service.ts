import "server-only";

import { runtimeMessages } from "@/lib/runtime-mode";
import { isProductAvailableForPurchase } from "@/features/products/domain";
import { createProductRepository } from "@/features/products/server/product-repository";
import {
  calculateCartSubtotalCents,
  validatePurchasableProduct,
  validateQuantityForStock
} from "../domain";
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

  return toResult(await cartRepository.getActiveCart(actor));
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
    await cartRepository.addItem(actor, {
      productId: productValidation.product.id,
      productNameSnapshot: productValidation.product.name,
      unitPriceSnapshotCents: productValidation.product.priceCents,
      quantity: input.quantity
    })
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

  return toResult(updated);
}

export async function removeCartItem(itemId: string): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  return toResult(await cartRepository.removeItem(actor, itemId));
}

export async function clearActiveCart(): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  return toResult(await cartRepository.clearCart(actor));
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
  if (guestCart.id === null || guestCart.items.length === 0) {
    return toResult(await cartRepository.getOrCreateActiveCart(userActor));
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

  const merged = await cartRepository.getActiveCart(userActor);
  return toResult({ ...merged, messages: [...merged.messages, ...warnings] });
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

  return { ...cart, items, subtotalCents: calculateCartSubtotalCents(items), messages };
}

function toResult(cart: CartView): CartActionResult {
  if (cart.persistence === "dev_fallback") {
    return { status: "fallback", cart, message: runtimeMessages.cartFallbackNotPersisted };
  }

  return { status: "success", cart, message: runtimeMessages.cartUpdated };
}
