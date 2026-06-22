"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money";
import {
  quoteShippingStateAction,
  removeShippingSelectionStateAction,
  selectShippingOptionStateAction,
  type CartShippingActionState
} from "@/features/cart/server/cart-actions";
import type { ShippingQuote } from "../types";

type Props = {
  quote?: ShippingQuote | null;
  cartId: string | null;
  cartHash: string;
  destinationPostalCode?: string | null;
};

const initialState: CartShippingActionState = {
  status: "idle",
  message: ""
};

export function ShippingQuotePanel({ quote, cartId, cartHash, destinationPostalCode }: Props) {
  const router = useRouter();
  const [quoteState, quoteAction, quotePending] = useActionState(quoteShippingStateAction, initialState);
  const [selectState, selectAction, selectPending] = useActionState(selectShippingOptionStateAction, initialState);
  const [removeState, removeAction, removePending] = useActionState(removeShippingSelectionStateAction, initialState);
  const options = quote?.options ?? [];
  const message = removeState.message || selectState.message || quoteState.message;
  const messageStatus = removeState.message ? removeState.status : selectState.message ? selectState.status : quoteState.status;

  useEffect(() => {
    if (quoteState.status === "success" || selectState.status === "success" || removeState.status === "success") {
      router.refresh();
    }
  }, [quoteState.status, selectState.status, removeState.status, router]);

  return (
    <section className="shipping-panel" aria-label="Frete">
      <h3>Frete manual</h3>
      <form action={quoteAction} className="shipping-form">
        <input type="hidden" name="cartId" value={cartId ?? ""} />
        <input type="hidden" name="cartHash" value={cartHash} />
        <label className="form-field">
          <span>CEP</span>
          <input name="postalCode" defaultValue={destinationPostalCode ?? ""} placeholder="00000-000" />
        </label>
        <button type="submit" disabled={quotePending}>Cotar</button>
      </form>

      {options.length > 0 ? (
        <div className="shipping-options">
          {options.map((option) => (
            <div className="shipping-option" key={option.id}>
              <div>
                <strong>{option.label}</strong>
                <p className="muted">{option.estimatedDays ? `${option.estimatedDays} dias` : "Prazo a confirmar"}</p>
              </div>
              <div>
                <p>{formatMoney(option.priceCents)}</p>
                <form action={selectAction}>
                  <input type="hidden" name="quoteId" value={quote?.id ?? ""} />
                  <input type="hidden" name="optionId" value={option.id} />
                  <input type="hidden" name="postalCode" value={quote?.postalCode ?? ""} />
                  <button type="submit" disabled={selectPending}>Selecionar</button>
                </form>
              </div>
            </div>
          ))}
          <form action={removeAction}>
            <input type="hidden" name="quoteId" value={quote?.id ?? ""} />
            <button type="submit" disabled={removePending}>Remover frete</button>
          </form>
        </div>
      ) : (
        <p className="muted">Informe o CEP para ver opções de entrega disponíveis.</p>
      )}

      {message ? (
        <p className={`form-message ${messageStatus === "success" ? "form-message--success" : "form-message--error"}`} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
