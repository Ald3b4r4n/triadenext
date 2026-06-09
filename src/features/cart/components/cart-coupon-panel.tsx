"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

  useEffect(() => {
    if (applyState.status === "success" || removeState.status === "success") {
      router.refresh();
    }
  }, [applyState.status, removeState.status, router]);

  return (
    <div className="coupon-panel">
      <h3>Cupom</h3>
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
          <label className="form-field">
            <span>Código</span>
            <input name="code" placeholder="DEV10" />
          </label>
          <button type="submit" disabled={applyPending}>
            Aplicar
          </button>
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
      <p className="muted">
        Frete grátis está apenas preparado: esta fase não calcula nem zera frete real.
      </p>
    </div>
  );
}
