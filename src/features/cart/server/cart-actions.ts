"use server";

import { revalidatePath } from "next/cache";
import {
  addCartItemSchema,
  removeCartItemSchema,
  updateCartItemQuantitySchema
} from "../schemas";
import type { CartActionResult } from "../types";
import {
  addItemToCart,
  clearActiveCart,
  getActiveCart,
  removeCartItem,
  updateCartItemQuantity
} from "./cart-service";

export async function getActiveCartAction() {
  return getActiveCart();
}

export async function addCartItemAction(formData: FormData): Promise<CartActionResult> {
  const parsed = addCartItemSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity") ?? 1
  });

  if (!parsed.success) {
    return { status: "validation_error", message: "Dados invalidos para adicionar ao carrinho." };
  }

  const result = await addItemToCart(parsed.data);
  revalidateCartPaths();
  return result;
}

export async function addCartItemFormAction(formData: FormData): Promise<void> {
  await addCartItemAction(formData);
}

export async function updateCartItemQuantityAction(formData: FormData): Promise<CartActionResult> {
  const parsed = updateCartItemQuantitySchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity")
  });

  if (!parsed.success) {
    return { status: "validation_error", message: "Quantidade invalida." };
  }

  const result = await updateCartItemQuantity(parsed.data);
  revalidateCartPaths();
  return result;
}

export async function updateCartItemQuantityFormAction(formData: FormData): Promise<void> {
  await updateCartItemQuantityAction(formData);
}

export async function removeCartItemAction(formData: FormData): Promise<CartActionResult> {
  const parsed = removeCartItemSchema.safeParse({
    itemId: formData.get("itemId")
  });

  if (!parsed.success) {
    return { status: "validation_error", message: "Item invalido." };
  }

  const result = await removeCartItem(parsed.data.itemId);
  revalidateCartPaths();
  return result;
}

export async function removeCartItemFormAction(formData: FormData): Promise<void> {
  await removeCartItemAction(formData);
}

export async function clearCartAction(): Promise<CartActionResult> {
  const result = await clearActiveCart();
  revalidateCartPaths();
  return result;
}

export async function clearCartFormAction(): Promise<void> {
  await clearCartAction();
}

function revalidateCartPaths() {
  revalidatePath("/carrinho");
  revalidatePath("/produtos");
}
