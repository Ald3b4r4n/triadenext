"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import {
  addCartItemStateAction,
  type AddCartItemActionState
} from "../server/cart-actions";
import { announceCartCount } from "./cart-count-badge";

type AddToCartFormProps = {
  productId: string;
  disabled?: boolean;
};

export function AddToCartForm({ productId, disabled = false }: AddToCartFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: AddCartItemActionState = {
    status: "idle",
    message: ""
  };
  const [state, formAction, isPending] = useActionState(
    addCartItemStateAction,
    initialState
  );

  useEffect(() => {
    if (state.status === "success") {
      const quantity = formRef.current
        ? Number(new FormData(formRef.current).get("quantity")) || 1
        : 1;
      announceCartCount({ delta: quantity });
      router.push("/carrinho");
    }
  }, [router, state.status]);

  return (
    <form ref={formRef} action={formAction} className="add-to-cart-form">
      <input type="hidden" name="productId" value={productId} />
      <label className="quantity-field">
        <span>Quantidade</span>
        <input
          name="quantity"
          type="number"
          min="1"
          defaultValue="1"
          disabled={disabled || isPending}
        />
      </label>
      <button
        className="primary-action"
        type="submit"
        disabled={disabled || isPending}
      >
        <ShoppingCart aria-hidden="true" size={18} />
        {isPending ? "Adicionando…" : "Adicionar ao carrinho"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={state.status === "error" ? "form-error" : "form-success"}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
