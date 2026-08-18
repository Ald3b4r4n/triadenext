"use client";

import { useActionState } from "react";
import { Tag } from "lucide-react";
import type { CouponView } from "@/features/coupons/types";
import {
  applyCouponStateAction,
  removeCouponStateAction,
  type CartCouponActionState
} from "../server/cart-actions";

type CartCouponPanelProps = {
  coupon: CouponView | null;
};

const initialState: CartCouponActionState = {
  status: "idle",
  message: ""
};

export function CartCouponPanel({ coupon }: CartCouponPanelProps) {
  const [applyState, applyAction, applyPending] = useActionState(
    applyCouponStateAction,
    initialState
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeCouponStateAction,
    initialState
  );
  const message = removeState.message || applyState.message;
  const messageStatus = removeState.message ? removeState.status : applyState.status;

  return (
    <div className="coupon-panel">
      <div className="cart-tool-heading">
        <Tag aria-hidden="true" size={20} />
        <div>
          <h3>Cupom de desconto</h3>
          <p>Tem um código? Aplique antes de finalizar.</p>
        </div>
      </div>
      {coupon ? (
        <div className="coupon-applied">
          <div>
            <strong>{coupon.code}</strong>
            <p className="muted">{coupon.valueLabel}</p>
          </div>
          <form action={removeAction}>
            <button className="text-action" type="submit" disabled={removePending}>
              Remover
            </button>
          </form>
        </div>
      ) : (
        <form action={applyAction} className="coupon-form">
          <label htmlFor="cart-coupon-code">Código</label>
          <div className="cart-inline-control">
            <input
              autoComplete="off"
              id="cart-coupon-code"
              name="code"
              aria-label="Código do cupom"
            />
            <button type="submit" disabled={applyPending}>
              {applyPending ? "Aplicando..." : "Aplicar"}
            </button>
          </div>
        </form>
      )}
      {message ? (
        <p
          className={`form-message ${
            messageStatus === "success" ? "form-message--success" : "form-message--error"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      <p className="cart-tool-note">Cupons de frete grátis zeram a opção de entrega elegível.</p>
    </div>
  );
}
