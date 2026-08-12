"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Package, ShieldCheck, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { CartCouponPanel } from "./cart-coupon-panel";
import { ShippingQuotePanel } from "@/features/shipping/components/shipping-quote-panel";
import {
  clearCartFormAction,
  removeCartItemFormAction
} from "../server/cart-actions";
import type { CartView as CartViewModel } from "../types";
import { announceCartCount } from "./cart-count-badge";
import { CartQuantityForm } from "./cart-quantity-form";

type CartViewProps = {
  cart: CartViewModel;
};

export function CartView({ cart }: CartViewProps) {
  const [visibleCart, setVisibleCart] = useState(cart);
  const [mutationMessage, setMutationMessage] = useState("");
  const itemCount = visibleCart.items.reduce((total, item) => total + item.quantity, 0);

  function updateQuantityOptimistically(itemId: string, quantity: number) {
    setMutationMessage("");
    setVisibleCart((current) => {
      const items = current.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, itemSubtotalCents: item.unitPriceSnapshotCents * quantity }
          : item
      );
      const subtotalCents = items.reduce((total, item) => total + item.itemSubtotalCents, 0);
      const discountCents = Math.min(current.discountCents, subtotalCents);
      const next = {
        ...current,
        items,
        subtotalCents,
        discountCents,
        shippingPostalCode: null,
        shippingQuoteId: null,
        shippingQuote: null,
        shippingOptions: [],
        shippingAmountCents: 0,
        partialTotalCents: subtotalCents - discountCents,
        partialTotalWithShippingCents: subtotalCents - discountCents
      };
      announceCartCount({ count: items.reduce((total, item) => total + item.quantity, 0) });
      return next;
    });
  }

  function settleCart(nextCart: CartViewModel) {
    setVisibleCart(nextCart);
    setMutationMessage("Quantidade atualizada.");
    announceCartCount({ count: nextCart.items.reduce((total, item) => total + item.quantity, 0) });
  }

  function handleMutationError(message: string) {
    setVisibleCart(cart);
    setMutationMessage(message);
    announceCartCount({ count: cart.items.reduce((total, item) => total + item.quantity, 0) });
  }

  return (
    <section className="cart-layout" aria-label="Carrinho">
      <div className="cart-main">
        {mutationMessage ? (
          <div className={`form-message ${mutationMessage === "Quantidade atualizada." ? "form-message--success" : "form-message--error"}`} role="status">
            <p>{mutationMessage}</p>
          </div>
        ) : null}
        {visibleCart.messages.length > 0 ? (
          <div className="form-message form-message--error" role="status">
            {Array.from(new Set(visibleCart.messages)).map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        ) : null}

        {visibleCart.items.length === 0 ? (
          <div className="placeholder-panel">
            <p className="muted">Carrinho vazio</p>
            <h2>Nenhum item adicionado</h2>
            <p>Escolha um produto publicado e com estoque para iniciar sua sessão de compra.</p>
            <Link className="primary-action" href="/produtos">
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-section-heading">
              <div>
                <h2>Seus produtos</h2>
                <p>{itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho</p>
              </div>
              <Link href="/produtos">
                <ArrowLeft aria-hidden="true" size={17} />
                Continuar comprando
              </Link>
            </div>
            <div className="cart-items">
              {visibleCart.items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div
                    className={`cart-item__identity ${item.productImageUrl ? "cart-item__identity--image" : ""}`}
                    role={item.productImageUrl ? "img" : undefined}
                    aria-label={item.productImageUrl ? (item.productImageAlt ?? item.productNameSnapshot) : undefined}
                    aria-hidden={item.productImageUrl ? undefined : true}
                    style={item.productImageUrl ? { backgroundImage: `url(${item.productImageUrl})` } : undefined}
                  >
                    {item.productImageUrl ? null : <Package size={24} />}
                  </div>
                  <div className="cart-item__details">
                    <p className="cart-item__label">Produto</p>
                    <h3>{item.productNameSnapshot}</h3>
                    <p>Preço unitário: {formatMoney(item.unitPriceSnapshotCents)}</p>
                  </div>
                  <CartQuantityForm
                    itemId={item.id}
                    initialQuantity={item.quantity}
                    onOptimisticChange={updateQuantityOptimistically}
                    onSettled={settleCart}
                    onError={handleMutationError}
                  />
                  <div className="cart-item__subtotal">
                    <span>Subtotal</span>
                    <strong>{formatMoney(item.itemSubtotalCents)}</strong>
                  </div>
                  <form action={removeCartItemFormAction} className="cart-item__remove">
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="icon-action" type="submit" aria-label={`Remover ${item.productNameSnapshot}`}>
                      <Trash2 aria-hidden="true" size={18} />
                    </button>
                  </form>
                </article>
              ))}
            </div>
            <div className="cart-tools">
              <CartCouponPanel coupon={visibleCart.coupon} />
              <ShippingQuotePanel
                cartId={visibleCart.id}
                cartHash={visibleCart.items.map((item) => `${item.productId}:${item.quantity}`).join("|")}
                destinationPostalCode={visibleCart.shippingPostalCode}
                quote={visibleCart.shippingQuote}
              />
            </div>
          </>
        )}
      </div>

      <aside className="cart-summary" aria-label="Resumo do carrinho">
        <div className="cart-summary__header">
          <p>Resumo do pedido</p>
          <h2>Total da compra</h2>
        </div>
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatMoney(visibleCart.subtotalCents)}</strong>
        </div>
        <div className="summary-row">
          <span>Desconto</span>
          <strong>-{formatMoney(visibleCart.discountCents)}</strong>
        </div>
        <div className="summary-row">
          <span>Frete</span>
          <strong>{visibleCart.shippingQuoteId ? formatMoney(visibleCart.shippingAmountCents) : "A calcular"}</strong>
        </div>
        <div className="summary-row summary-row--total">
          <span>Total</span>
          <strong>{formatMoney(visibleCart.partialTotalWithShippingCents)}</strong>
        </div>
        <div className="cart-summary__security">
          <ShieldCheck aria-hidden="true" size={20} />
          <p>Pagamento protegido e pedido criado somente após sua revisão.</p>
        </div>
        {visibleCart.items.length === 0 || !visibleCart.shippingQuoteId ? (
          <button className="primary-action" type="button" disabled>
            Selecione itens e frete
          </button>
        ) : visibleCart.owner.kind === "guest" ? (
          <Link className="primary-action" href="/login?returnTo=/checkout">
            Entrar e continuar
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        ) : (
          <Link className="primary-action" href="/checkout">
            Continuar para o checkout
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        )}
        {visibleCart.items.length > 0 ? (
          <form action={clearCartFormAction}>
            <button className="text-action cart-clear" type="submit">
              Limpar carrinho
            </button>
          </form>
        ) : null}
      </aside>
    </section>
  );
}
