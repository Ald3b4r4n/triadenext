import "server-only";

import { runtimeMessages } from "@/lib/runtime-mode";
import { isProductAvailableForPurchase } from "@/features/products/domain";
import { createProductRepository } from "@/features/products/server/product-repository";
import { calculateAppliedCoupon, findCouponById, validateCouponForCart } from "@/features/coupons/server/coupon-service";
import { calculateCouponDiscountCents } from "@/features/coupons/domain";
import type { CartActionResult, CartActor, CartItem, CartView } from "../types";
import { calculateCartSubtotalCents, validatePurchasableProduct, validateQuantityForStock } from "../domain";
import { createCartRepository } from "./cart-repository";
import { resolveCartActor } from "./cart-session";
import { createShippingRepository } from "@/features/shipping/server/shipping-repository";
import { createShippingQuote, buildManualShippingOptions, validatePostalCode } from "@/features/shipping/domain";
import { devShippingRules } from "@/features/shipping/server/shipping-fixtures";
import { selectShippingQuoteOption } from "@/features/shipping/server/shipping-service";

const cartRepository = createCartRepository();
const productRepository = createProductRepository();
const shippingRepository = createShippingRepository();

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
  const currentQuantity = currentCart.items.find((item) => item.productId === input.productId)?.quantity ?? 0;
  const quantityValidation = validateQuantityForStock(
    currentQuantity + input.quantity,
    productValidation.product.stockQuantity
  );

  if (quantityValidation.status === "invalid") {
    return { status: "validation_error", message: "Quantidade inválida." };
  }

  if (quantityValidation.status === "insufficient_stock") {
    return {
      status: "insufficient_stock",
      message: runtimeMessages.cartInsufficientStock,
      maxQuantity: quantityValidation.maxQuantity
    };
  }

  return toResult(
    await recalculateCartForActor(
      actor,
      await cartRepository.addItem(actor, {
        productId: productValidation.product.id,
        productNameSnapshot: productValidation.product.name,
        unitPriceSnapshotCents: productValidation.product.priceCents,
        quantity: input.quantity
      })
    )
  );
}

export async function updateCartItemQuantity(input: { itemId: string; quantity: number }): Promise<CartActionResult> {
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

  const quantityValidation = validateQuantityForStock(input.quantity, productValidation.product.stockQuantity);
  if (quantityValidation.status === "invalid") {
    return { status: "validation_error", message: "Quantidade inválida." };
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
    return { status: "coupon_invalid", message: validation.message, cart };
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

export async function quoteShippingForActiveCart(input: { postalCode: string }): Promise<CartActionResult> {
  const actor = await resolveCartActor({ createGuestToken: true });
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  const cart = await cartRepository.getOrCreateActiveCart(actor);
  const validation = validatePostalCode(input.postalCode);
  if (validation.status === "invalid") {
    return { status: "validation_error", message: validation.message };
  }

  const manualRules = await shippingRepository.listManualRules();
  const rules = manualRules.length > 0 ? manualRules : devShippingRules;
  const options = buildManualShippingOptions(rules, { postalCode: validation.postalCode });
  if (options.length === 0) {
    return { status: "validation_error", message: "Não há cobertura manual para este CEP." };
  }

  const quote = await shippingRepository.createQuote(
    createShippingQuote({
      cartId: cart.id,
      cartHash: buildCartHash(cart),
      postalCode: validation.postalCode,
      options,
      source: rules === devShippingRules ? "fixture" : "manual"
    })
  );

  const selected = quote.options[0]!;
  const updated = await cartRepository.setShippingSelection(actor, {
    postalCode: quote.postalCode,
    quoteId: quote.id,
    quote,
    option: selected
  });

  return toResult(await recalculateCartForActor(actor, updated));
}

export async function selectShippingOptionForActiveCart(input: {
  quoteId: string;
  optionId: string;
}): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  const cart = await cartRepository.getActiveCart(actor);
  const quote = await shippingRepository.findQuoteById(input.quoteId);
  if (!quote) {
    return { status: "validation_error", message: "Cotação não encontrada." };
  }

  if (cart.id === null || quote.cartId !== cart.id) {
    return { status: "forbidden", message: runtimeMessages.cartForbidden };
  }

  const selection = await selectShippingQuoteOption(input);
  if (selection.status !== "success") {
    return { status: "validation_error", message: selection.message };
  }

  const option = selection.quote.options.find((item) => item.id === selection.quote.selectedOptionId) ?? selection.quote.options[0]!;
  const updated = await cartRepository.setShippingSelection(actor, {
    postalCode: selection.quote.postalCode,
    quoteId: selection.quote.id,
    quote: selection.quote,
    option
  });

  return toResult(await recalculateCartForActor(actor, updated));
}

export async function removeShippingSelectionFromActiveCart(): Promise<CartActionResult> {
  const actor = await resolveCartActor();
  if (actor.kind === "unavailable") {
    return { status: "unavailable", message: runtimeMessages.cartUnavailable };
  }

  return toResult(await recalculateCartForActor(actor, await cartRepository.clearShippingSelection(actor)));
}

export async function mergeGuestCartIntoUser(input: { userId: string; guestToken: string | null }): Promise<CartActionResult> {
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
      warnings.push(`Item indisponível removido da sua conta: ${item.productNameSnapshot}.`);
      continue;
    }

    const userCart = await cartRepository.getActiveCart(userActor);
    const existingQuantity = userCart.items.find((userItem) => userItem.productId === item.productId)?.quantity ?? 0;
    const allowedQuantity = Math.min(item.quantity, Math.max(product.stockQuantity - existingQuantity, 0));
    if (allowedQuantity <= 0) {
      warnings.push(`Estoque indisponível para ${item.productNameSnapshot}.`);
      continue;
    }

    if (allowedQuantity < item.quantity) {
      warnings.push(`Quantidade de ${item.productNameSnapshot} limitada ao estoque disponível.`);
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
      messages.push(`${item.productNameSnapshot} não está disponível para compra.`);
      continue;
    }

    if (item.quantity > product.stockQuantity) {
      messages.push(`${item.productNameSnapshot} excede o estoque disponível.`);
      items.push({
        ...item,
        quantity: product.stockQuantity,
        itemSubtotalCents: item.unitPriceSnapshotCents * product.stockQuantity
      });
      continue;
    }

    items.push(item);
  }

  const subtotalCents = calculateCartSubtotalCents(items);
  const coupon = cart.appliedCouponId ? await findCouponById(cart.appliedCouponId) : null;
  const discountCents = coupon ? calculateCouponDiscountCents(coupon, subtotalCents) : 0;
  const shippingAmountCents = cart.shippingAmountCents;
  const freeShipping = coupon?.type === "free_shipping" && shippingAmountCents > 0;
  const effectiveShippingAmountCents = freeShipping ? 0 : shippingAmountCents;
  const partialTotalCents = subtotalCents - discountCents;

  const couponCalculation = cart.appliedCouponId
    ? await calculateAppliedCoupon({ couponId: cart.appliedCouponId, subtotalCents })
    : null;

  return {
    ...cart,
    items,
    subtotalCents,
    coupon: couponCalculation?.coupon ?? null,
    discountCents: couponCalculation?.discountCents ?? discountCents,
    shippingAmountCents: effectiveShippingAmountCents,
    partialTotalCents,
    partialTotalWithShippingCents: partialTotalCents + effectiveShippingAmountCents,
    messages: [
      ...messages,
      ...(couponCalculation?.messages ?? []),
      ...(freeShipping ? ["Cupom de frete grátis zerou o frete manual elegível."] : [])
    ]
  };
}

async function recalculateCartForActor(actor: Exclude<CartActor, { kind: "unavailable" }>, cart: CartView) {
  const recalculated = await recalculateCartView(cart);
  const hasInvalidAppliedCoupon = cart.appliedCouponId !== null && recalculated.coupon === null;

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

function buildCartHash(cart: CartView) {
  return `${cart.items.map((item) => `${item.productId}:${item.quantity}`).join("|")}|${cart.subtotalCents}`;
}
