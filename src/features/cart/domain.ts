import { isProductAvailableForPurchase } from "@/features/products/domain";
import type { Product } from "@/features/products/types";
import type { CartItem } from "./types";

export function calculateItemSubtotalCents(unitPriceSnapshotCents: number, quantity: number) {
  return unitPriceSnapshotCents * quantity;
}

export function calculateCartSubtotalCents(
  items: Pick<CartItem, "unitPriceSnapshotCents" | "quantity">[]
) {
  return items.reduce(
    (subtotal, item) =>
      subtotal + calculateItemSubtotalCents(item.unitPriceSnapshotCents, item.quantity),
    0
  );
}

export function validateQuantityForStock(quantity: number, stockQuantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { status: "invalid" as const, maxQuantity: Math.max(stockQuantity, 0) };
  }

  if (quantity > stockQuantity) {
    return { status: "insufficient_stock" as const, maxQuantity: Math.max(stockQuantity, 0) };
  }

  return { status: "valid" as const, maxQuantity: stockQuantity };
}

export function validatePurchasableProduct(product: Product | null, now = new Date()) {
  if (product === null || !isProductAvailableForPurchase(product, now)) {
    return { status: "product_unavailable" as const };
  }

  return { status: "available" as const, product };
}

export function toCartItemSubtotal(item: Omit<CartItem, "itemSubtotalCents">): CartItem {
  return {
    ...item,
    itemSubtotalCents: calculateItemSubtotalCents(item.unitPriceSnapshotCents, item.quantity)
  };
}
