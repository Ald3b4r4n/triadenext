"use client";

import { useActionState, useState } from "react";
import { formatMoney } from "@/lib/money";
import {
  quoteShippingStateAction,
  removeShippingSelectionStateAction,
  selectShippingOptionStateAction,
  type CartShippingActionState
} from "@/features/cart/server/cart-actions";
import type { ShippingQuote } from "../types";
import { Check, Truck } from "lucide-react";

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
  const [postalCode, setPostalCode] = useState(() => formatPostalCodeInput(destinationPostalCode ?? ""));
  const [pendingSelectionId, setPendingSelectionId] = useState<string | null>(null);
  const [quoteState, quoteAction, quotePending] = useActionState(quoteShippingStateAction, initialState);
  const [selectState, selectAction, selectPending] = useActionState(selectShippingOptionStateAction, initialState);
  const [removeState, removeAction, removePending] = useActionState(removeShippingSelectionStateAction, initialState);
  const options = quote?.options ?? [];
  const message = removeState.message || selectState.message || quoteState.message;
  const messageStatus = removeState.message ? removeState.status : selectState.message ? selectState.status : quoteState.status;

  const selectedOptionId = selectPending && pendingSelectionId
    ? pendingSelectionId
    : quote?.selectedOptionId ?? null;

  return (
    <section className="shipping-panel" aria-label="Frete">
      <div className="cart-tool-heading">
        <Truck aria-hidden="true" size={20} />
        <div>
          <h3>Entrega</h3>
          <p>Consulte prazos e valores para o seu CEP.</p>
        </div>
      </div>
      <form action={quoteAction} className="shipping-form">
        <input type="hidden" name="cartId" value={cartId ?? ""} />
        <input type="hidden" name="cartHash" value={cartHash} />
        <label htmlFor="cart-shipping-postal-code">CEP</label>
        <div className="cart-inline-control">
          <input
            id="cart-shipping-postal-code"
            name="postalCode"
            value={postalCode}
            onChange={(event) => setPostalCode(formatPostalCodeInput(event.target.value))}
            placeholder="00000-000"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={9}
          />
          <button type="submit" disabled={quotePending}>
            {quotePending ? "Cotando..." : "Cotar"}
          </button>
        </div>
      </form>

      {options.length > 0 ? (
        <div className="shipping-options">
          {options.map((option) => (
            <div
              className={`shipping-option ${selectedOptionId === option.id ? "shipping-option--selected" : ""} ${selectPending && selectedOptionId === option.id ? "shipping-option--updating" : ""}`}
              key={option.id}
            >
              <div>
                <strong>{option.label}</strong>
                <p className="muted">{option.estimatedDays ? `${option.estimatedDays} dias` : "Prazo a confirmar"}</p>
              </div>
              <div>
                <p>{formatMoney(option.priceCents)}</p>
                <form action={selectAction} onSubmit={() => setPendingSelectionId(option.id)}>
                  <input type="hidden" name="quoteId" value={quote?.id ?? ""} />
                  <input type="hidden" name="optionId" value={option.id} />
                  <input type="hidden" name="postalCode" value={quote?.postalCode ?? ""} />
                  <button type="submit" disabled={selectPending || selectedOptionId === option.id}>
                    {selectedOptionId === option.id ? (
                      <><Check aria-hidden="true" size={15} /> {selectPending ? "Atualizando" : "Selecionado"}</>
                    ) : "Selecionar"}
                  </button>
                </form>
              </div>
            </div>
          ))}
          <form action={removeAction} className="shipping-options__remove">
            <input type="hidden" name="quoteId" value={quote?.id ?? ""} />
            <button className="text-action" type="submit" disabled={removePending}>
              {removePending ? "Removendo..." : "Remover seleção de frete"}
            </button>
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

function formatPostalCodeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}
