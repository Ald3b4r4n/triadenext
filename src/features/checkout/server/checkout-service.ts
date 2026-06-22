import "server-only";

import { getRuntimeMode, runtimeMessages } from "@/lib/runtime-mode";
import { validatePurchasableProduct, validateQuantityForStock } from "@/features/cart/domain";
import { createCartRepository } from "@/features/cart/server/cart-repository";
import { recalculateCartView } from "@/features/cart/server/cart-service";
import { getCurrentSession } from "@/features/auth/server/session";
import { validateCouponForSubtotal } from "@/features/coupons/domain";
import { findCouponById } from "@/features/coupons/server/coupon-service";
import { isQuoteExpired } from "@/features/shipping/domain";
import { createProductRepository } from "@/features/products/server/product-repository";
import {
  buildAddressSnapshot,
  buildCouponSnapshot,
  buildCustomerSnapshot,
  buildPendingOrderDraft,
  buildShippingSnapshot,
  normalizePostalCode
} from "@/features/orders/domain";
import { checkoutFormSchema } from "@/features/orders/schemas";
import { createOrderRepository } from "@/features/orders/server/order-repository";
import type { CheckoutFormInput } from "@/features/orders/schemas";
import type { PendingOrder } from "@/features/orders/types";

const cartRepository = createCartRepository();
const orderRepository = createOrderRepository();
const productRepository = createProductRepository();

export type CheckoutReviewResult =
  | { status: "success"; cart: Awaited<ReturnType<typeof recalculateCartView>>; email: string; message?: string }
  | { status: "unauthenticated"; message: string }
  | { status: "validation_error"; message: string }
  | { status: "unavailable"; message: string };

export type CheckoutCreateResult =
  | { status: "success"; order: PendingOrder; message: string }
  | { status: "fallback"; order: PendingOrder; message: string }
  | { status: "unauthenticated"; message: string }
  | { status: "validation_error"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "unavailable"; message: string };

export async function reviewPendingCheckout(): Promise<CheckoutReviewResult> {
  const session = await getCurrentSession();
  if (session.status !== "authenticated") {
    return { status: "unauthenticated", message: runtimeMessages.checkoutUnauthenticated };
  }

  const actor = { kind: "authenticated" as const, userId: session.userId, role: session.role };
  const cart = await recalculateCartView(await cartRepository.getActiveCart(actor));
  const validation = await validateCartForCheckout(cart);
  if (validation.status !== "valid") {
    return { status: "validation_error", message: validation.message };
  }

  return { status: "success", cart, email: session.email };
}

export async function createPendingCheckoutOrder(input: CheckoutFormInput): Promise<CheckoutCreateResult> {
  const session = await getCurrentSession();
  if (session.status !== "authenticated") {
    return { status: "unauthenticated", message: runtimeMessages.checkoutUnauthenticated };
  }

  const parsed = checkoutFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "validation_error",
      message: parsed.error.issues[0]?.message ?? runtimeMessages.checkoutValidationError
    };
  }

  const actor = { kind: "authenticated" as const, userId: session.userId, role: session.role };
  const cart = await recalculateCartView(await cartRepository.getActiveCart(actor));
  const validation = await validateCartForCheckout(cart);
  if (validation.status !== "valid") {
    return { status: "validation_error", message: validation.message };
  }

  if (cart.owner.kind !== "user" || cart.owner.userId !== session.userId) {
    return { status: "forbidden", message: runtimeMessages.cartForbidden };
  }

  const address = buildAddressSnapshot({
    ...parsed.data,
    fullName: parsed.data.fullName
  });

  if (cart.shippingPostalCode && normalizePostalCode(cart.shippingPostalCode) !== address.postalCode) {
    return {
      status: "validation_error",
      message: "CEP do endereço precisa ser o mesmo da cotação de frete selecionada."
    };
  }

  const products = await Promise.all(cart.items.map((item) => productRepository.findProductById(item.productId)));
  const realProducts = products.filter((product) => product !== null);
  const coupon = cart.appliedCouponId ? await findCouponById(cart.appliedCouponId) : null;
  const couponSnapshot = buildCouponSnapshot({ coupon, discountCents: cart.discountCents });
  const shippingSnapshot = buildShippingSnapshot(cart);
  if (!shippingSnapshot) {
    return { status: "validation_error", message: "Selecione um frete válido antes do checkout." };
  }

  const draft = buildPendingOrderDraft({
    userId: session.userId,
    cart,
    products: realProducts,
    customerSnapshot: buildCustomerSnapshot({
      fullName: parsed.data.fullName,
      email: session.email,
      phone: parsed.data.phone
    }),
    shippingAddressSnapshot: address,
    shippingSnapshot,
    couponSnapshot
  });

  const result = await orderRepository.createPendingOrder(draft);
  if (result.status === "unavailable") {
    return { status: "unavailable", message: result.message };
  }

  await cartRepository.markCartConverted(cart.id ?? "");

  return result.status === "dev_fallback"
    ? { status: "fallback", order: result.order, message: result.message }
    : { status: "success", order: result.order, message: result.message };
}

async function validateCartForCheckout(cart: Awaited<ReturnType<typeof recalculateCartView>>) {
  const mode = getRuntimeMode();
  if (!mode.hasDatabase && mode.appEnvironment !== "development" && mode.appEnvironment !== "test") {
    return { status: "invalid" as const, message: runtimeMessages.checkoutUnavailable };
  }

  if (cart.id === null || cart.items.length === 0) {
    return { status: "invalid" as const, message: "Carrinho vazio não pode iniciar checkout." };
  }

  if (cart.status !== "active") {
    return { status: "invalid" as const, message: "Carrinho convertido ou bloqueado não pode iniciar checkout." };
  }

  for (const item of cart.items) {
    const product = await productRepository.findProductById(item.productId);
    const productValidation = validatePurchasableProduct(product);
    if (productValidation.status !== "available") {
      return { status: "invalid" as const, message: `${item.productNameSnapshot} não está disponível.` };
    }

    const stockValidation = validateQuantityForStock(item.quantity, productValidation.product.stockQuantity);
    if (stockValidation.status !== "valid") {
      return { status: "invalid" as const, message: `${item.productNameSnapshot} excede o estoque disponível.` };
    }
  }

  if (cart.appliedCouponId) {
    const coupon = await findCouponById(cart.appliedCouponId);
    const couponValidation = validateCouponForSubtotal(coupon, cart.subtotalCents);
    if (couponValidation.status !== "valid") {
      return { status: "invalid" as const, message: couponValidation.message };
    }
  }

  if (!cart.shippingQuote || !cart.shippingQuoteId || !cart.shippingQuote.selectedOptionId) {
    return { status: "invalid" as const, message: "Selecione um frete válido antes do checkout." };
  }

  if (isQuoteExpired(cart.shippingQuote)) {
    return { status: "invalid" as const, message: "Cotação de frete expirada. Recalcule o frete." };
  }

  if (cart.shippingQuote.cartId !== cart.id) {
    return { status: "invalid" as const, message: "Cotação de frete não pertence ao carrinho atual." };
  }

  return { status: "valid" as const };
}
