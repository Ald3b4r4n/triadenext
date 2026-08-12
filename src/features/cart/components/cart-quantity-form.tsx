"use client";

import { useState, useTransition } from "react";
import { updateCartItemQuantityAction } from "../server/cart-actions";
import type { CartView } from "../types";

type Props = {
  itemId: string;
  initialQuantity: number;
  onOptimisticChange: (itemId: string, quantity: number) => void;
  onSettled: (cart: CartView) => void;
  onError: (message: string) => void;
};

export function CartQuantityForm({
  itemId,
  initialQuantity,
  onOptimisticChange,
  onSettled,
  onError
}: Props) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="cart-quantity-form"
      onSubmit={(event) => {
        event.preventDefault();
        const nextQuantity = Math.max(1, Math.trunc(quantity || 1));
        setQuantity(nextQuantity);
        onOptimisticChange(itemId, nextQuantity);

        const formData = new FormData();
        formData.set("itemId", itemId);
        formData.set("quantity", String(nextQuantity));

        startTransition(async () => {
          const result = await updateCartItemQuantityAction(formData);
          if (result.status === "success" || result.status === "fallback") {
            onSettled(result.cart);
            return;
          }
          onError(result.message);
        });
      }}
    >
      <label className="quantity-field">
        <span>Quantidade</span>
        <input
          name="quantity"
          type="number"
          min="1"
          value={quantity}
          disabled={isPending}
          onChange={(event) => setQuantity(event.target.valueAsNumber || 1)}
        />
      </label>
      <button type="submit" disabled={isPending || quantity === initialQuantity}>
        {isPending ? "Salvando…" : quantity === initialQuantity ? "Atualizado" : "Atualizar"}
      </button>
    </form>
  );
}
